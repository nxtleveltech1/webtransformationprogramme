import { prisma } from "@/lib/db";
import { hasTable } from "@/lib/services/schema-guards";
import { parseDateMs } from "@/lib/utils";

/**
 * Critical Path Method (CPM) computation over the {@link TaskDependency} graph.
 *
 * The platform stores task dates as free-text strings (`baselineStartDate`,
 * `forecastStartDate`, ...). We only ever trust genuine ISO dates (via
 * `parseDateMs`); anything else is treated as "no usable date" and the task is
 * handled defensively rather than fabricated.
 *
 * Approach:
 *  1. Derive each task's duration (in days) from baseline dates (preferred) or
 *     forecast dates (fallback). Tasks with no parseable date pair get a
 *     duration of 0 and are flagged `hasDuration: false` so the UI can surface
 *     that they were least-constrained, not invented.
 *  2. Build the dependency graph. We support the four standard relationships
 *     parsed from the free-text `dependencyType` (FS/SS/FF/SF), defaulting to
 *     Finish-to-Start, plus `lagDays`.
 *  3. Detect cycles with a DFS colouring pass. Edges that participate in a cycle
 *     are dropped from the scheduling pass (so we never loop) and reported.
 *  4. Forward pass in topological order -> early start / early finish.
 *  5. Backward pass -> late start / late finish, using the project finish as the
 *     bound. Total float = LS - ES (== LF - EF). Float <= ~0 => critical.
 *  6. The critical chain is the ordered run of critical tasks linked by
 *     dependency edges, longest-path first.
 *
 * Everything is computed in **integer days** on an abstract timeline (working in
 * day units, not calendar dates) so that tasks with and without anchor dates can
 * be scheduled together. Where real anchor dates exist they seed the timeline;
 * otherwise the graph topology drives the schedule.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** Standard CPM dependency relationships. */
export type DependencyRelation = "FS" | "SS" | "FF" | "SF";

export interface CpmTaskInput {
  id: string;
  externalId: string | null;
  title: string;
  status: string | null;
  percentComplete: number | null;
  /** Stored boolean flag on the Task row, kept for comparison vs. computed. */
  flaggedCritical: boolean;
  baselineStartDate: string | null;
  baselineEndDate: string | null;
  forecastStartDate: string | null;
  forecastEndDate: string | null;
  durationDays: number | null;
  workstreamName: string | null;
}

export interface CpmDependencyInput {
  id: string;
  predecessorTaskId: string;
  successorTaskId: string;
  dependencyType: string | null;
  lagDays: number | null;
}

export interface CpmTaskResult {
  id: string;
  externalId: string | null;
  title: string;
  status: string | null;
  percentComplete: number | null;
  workstreamName: string | null;
  /** Stored Task.criticalPath flag (for the "flagged" comparison column). */
  flaggedCritical: boolean;
  /** Duration in days used for scheduling. */
  durationDays: number;
  /** Where the duration came from. */
  durationSource: "baseline" | "forecast" | "durationDays" | "none";
  /** Whether a real duration could be derived (false => least-constrained). */
  hasDuration: boolean;
  /** Forward-pass results, in abstract day units from project start (day 0). */
  earlyStart: number;
  earlyFinish: number;
  /** Backward-pass results, in abstract day units from project start. */
  lateStart: number;
  lateFinish: number;
  /** Total float / slack in days (LS - ES). */
  totalFloat: number;
  /** Computed criticality: on a zero-float path. */
  isCritical: boolean;
  /** True when this task sits on a cycle (excluded from float math). */
  inCycle: boolean;
}

export interface CpmCycle {
  /** Ordered task ids forming the cycle (first repeats conceptually). */
  taskIds: string[];
  /** Human-readable labels for the cycle members. */
  labels: string[];
}

export interface CpmResult {
  tasks: CpmTaskResult[];
  /** Tasks on the computed critical path, ordered along the longest chain. */
  criticalChain: CpmTaskResult[];
  cycles: CpmCycle[];
  /** Project duration in days (max early finish). */
  projectDurationDays: number;
  summary: {
    totalTasks: number;
    scheduledTasks: number;
    undatedTasks: number;
    computedCritical: number;
    flaggedCritical: number;
    /** Tasks critical by computation but NOT flagged in the DB (and vice versa). */
    flagMismatch: number;
    cycleCount: number;
  };
}

/** Parse a free-text dependency type into a standard relation. Default FS. */
function parseRelation(value: string | null | undefined): DependencyRelation {
  const v = (value ?? "").trim().toUpperCase();
  if (v.startsWith("SS")) return "SS";
  if (v.startsWith("FF")) return "FF";
  if (v.startsWith("SF")) return "SF";
  // "FS", "FINISH-TO-START", "FINISH_START", empty, or anything unknown.
  return "FS";
}

/**
 * Derive a task's duration in whole days, preferring baseline dates, then
 * forecast dates, then the stored `durationDays`. Returns 0 with
 * `source: "none"` when nothing is parseable.
 */
function deriveDuration(task: CpmTaskInput): {
  days: number;
  source: CpmTaskResult["durationSource"];
} {
  const fromPair = (
    start: string | null,
    end: string | null,
  ): number | null => {
    const s = parseDateMs(start);
    const e = parseDateMs(end);
    if (s === null || e === null) return null;
    if (e < s) return null; // inverted range -> not usable
    // Inclusive day span (a task that starts and ends same day = 1 day).
    return Math.max(1, Math.round((e - s) / MS_PER_DAY) + 1);
  };

  const baseline = fromPair(task.baselineStartDate, task.baselineEndDate);
  if (baseline !== null) return { days: baseline, source: "baseline" };

  const forecast = fromPair(task.forecastStartDate, task.forecastEndDate);
  if (forecast !== null) return { days: forecast, source: "forecast" };

  if (task.durationDays != null && task.durationDays > 0) {
    return { days: task.durationDays, source: "durationDays" };
  }

  return { days: 0, source: "none" };
}

/**
 * Public helper: the duration in whole days the CPM engine would use for a task,
 * applying the same baseline -> forecast -> durationDays precedence. Exposed so
 * the scenario engine can derive a task's current duration before applying a
 * what-if delta.
 */
export function taskDurationDays(task: CpmTaskInput): number {
  return deriveDuration(task).days;
}

interface Edge {
  from: string; // predecessor
  to: string; // successor
  relation: DependencyRelation;
  lag: number;
}

/**
 * Detect cycles via DFS colouring. Returns the set of edges that participate in
 * a back-edge cycle (to be excluded from scheduling) and the cycle paths found.
 */
function detectCycles(
  nodeIds: string[],
  adjacency: Map<string, Edge[]>,
): { cycleEdges: Set<string>; cycles: string[][] } {
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const id of nodeIds) color.set(id, WHITE);

  const cycleEdges = new Set<string>();
  const cycles: string[][] = [];
  const stack: string[] = [];
  const onStack = new Set<string>();

  const edgeKey = (e: Edge) => `${e.from}->${e.to}`;

  // Iterative DFS to avoid blowing the call stack on large graphs.
  function visit(root: string) {
    type Frame = { node: string; iter: number };
    const frames: Frame[] = [{ node: root, iter: 0 }];
    color.set(root, GRAY);
    stack.push(root);
    onStack.add(root);

    while (frames.length > 0) {
      const frame = frames[frames.length - 1];
      const edges = adjacency.get(frame.node) ?? [];
      if (frame.iter < edges.length) {
        const edge = edges[frame.iter];
        frame.iter += 1;
        const next = edge.to;
        const c = color.get(next);
        if (c === GRAY && onStack.has(next)) {
          // Back edge -> cycle. Reconstruct the cycle from the DFS stack.
          cycleEdges.add(edgeKey(edge));
          const idx = stack.lastIndexOf(next);
          if (idx >= 0) cycles.push([...stack.slice(idx), next]);
        } else if (c === WHITE) {
          color.set(next, GRAY);
          stack.push(next);
          onStack.add(next);
          frames.push({ node: next, iter: 0 });
        }
      } else {
        color.set(frame.node, BLACK);
        onStack.delete(frame.node);
        stack.pop();
        frames.pop();
      }
    }
  }

  for (const id of nodeIds) {
    if (color.get(id) === WHITE) visit(id);
  }

  return { cycleEdges, cycles };
}

/** Kahn topological sort over the acyclic edge set. */
function topoSort(
  nodeIds: string[],
  edges: Edge[],
): string[] {
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) {
    indegree.set(id, 0);
    adj.set(id, []);
  }
  for (const e of edges) {
    adj.get(e.from)!.push(e.to);
    indegree.set(e.to, (indegree.get(e.to) ?? 0) + 1);
  }
  const queue: string[] = [];
  for (const id of nodeIds) if ((indegree.get(id) ?? 0) === 0) queue.push(id);
  // Stable order for deterministic output.
  queue.sort();
  const order: string[] = [];
  while (queue.length > 0) {
    const n = queue.shift()!;
    order.push(n);
    for (const m of adj.get(n) ?? []) {
      const d = (indegree.get(m) ?? 0) - 1;
      indegree.set(m, d);
      if (d === 0) {
        // Keep deterministic by inserting in sorted position.
        let i = queue.length;
        while (i > 0 && queue[i - 1] > m) i -= 1;
        queue.splice(i, 0, m);
      }
    }
  }
  // Any node not emitted was part of a residual cycle; append them so they still
  // appear (with float math skipped).
  if (order.length < nodeIds.length) {
    const seen = new Set(order);
    for (const id of nodeIds) if (!seen.has(id)) order.push(id);
  }
  return order;
}

/**
 * Pure CPM computation over the supplied tasks + dependencies. Exposed so the
 * algorithm can be reasoned about / tested independently of Prisma.
 */
export function computeCpm(
  tasks: CpmTaskInput[],
  dependencies: CpmDependencyInput[],
): CpmResult {
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const nodeIds = tasks.map((t) => t.id);

  // Durations.
  const duration = new Map<
    string,
    { days: number; source: CpmTaskResult["durationSource"] }
  >();
  for (const t of tasks) duration.set(t.id, deriveDuration(t));

  // Build edges (only between known tasks).
  const allEdges: Edge[] = [];
  for (const d of dependencies) {
    if (!taskById.has(d.predecessorTaskId) || !taskById.has(d.successorTaskId)) {
      continue;
    }
    if (d.predecessorTaskId === d.successorTaskId) continue; // self-loop
    allEdges.push({
      from: d.predecessorTaskId,
      to: d.successorTaskId,
      relation: parseRelation(d.dependencyType),
      lag: d.lagDays ?? 0,
    });
  }

  // Cycle detection on the full edge set.
  const adjacency = new Map<string, Edge[]>();
  for (const id of nodeIds) adjacency.set(id, []);
  for (const e of allEdges) adjacency.get(e.from)!.push(e);

  const { cycleEdges, cycles } = detectCycles(nodeIds, adjacency);

  // Scheduling edges = all edges minus those that close a cycle.
  const edgeKey = (e: Edge) => `${e.from}->${e.to}`;
  const schedEdges = allEdges.filter((e) => !cycleEdges.has(edgeKey(e)));

  const inCycle = new Set<string>();
  for (const cycle of cycles) for (const id of cycle) inCycle.add(id);

  const order = topoSort(nodeIds, schedEdges);

  // Predecessor / successor lookups on the scheduling graph.
  const preds = new Map<string, Edge[]>();
  const succs = new Map<string, Edge[]>();
  for (const id of nodeIds) {
    preds.set(id, []);
    succs.set(id, []);
  }
  for (const e of schedEdges) {
    succs.get(e.from)!.push(e);
    preds.get(e.to)!.push(e);
  }

  const dur = (id: string) => duration.get(id)?.days ?? 0;

  // ---- Forward pass: early start (ES) / early finish (EF). ----
  const ES = new Map<string, number>();
  const EF = new Map<string, number>();
  for (const id of order) {
    const incoming = preds.get(id) ?? [];
    let es = 0;
    for (const e of incoming) {
      const pES = ES.get(e.from) ?? 0;
      const pEF = EF.get(e.from) ?? pES;
      let candidate: number;
      switch (e.relation) {
        case "SS":
          candidate = pES + e.lag;
          break;
        case "FF":
          candidate = pEF + e.lag - dur(id);
          break;
        case "SF":
          candidate = pES + e.lag - dur(id);
          break;
        case "FS":
        default:
          candidate = pEF + e.lag;
          break;
      }
      if (candidate > es) es = candidate;
    }
    if (es < 0) es = 0;
    ES.set(id, es);
    EF.set(id, es + dur(id));
  }

  const projectDuration = Math.max(0, ...nodeIds.map((id) => EF.get(id) ?? 0));

  // ---- Backward pass: late finish (LF) / late start (LS). ----
  const LS = new Map<string, number>();
  const LF = new Map<string, number>();
  for (let i = order.length - 1; i >= 0; i -= 1) {
    const id = order[i];
    const outgoing = succs.get(id) ?? [];
    let lf = projectDuration;
    if (outgoing.length > 0) {
      lf = Infinity;
      for (const e of outgoing) {
        const sLS = LS.get(e.to) ?? projectDuration;
        const sLF = LF.get(e.to) ?? projectDuration;
        let candidate: number;
        switch (e.relation) {
          case "SS":
            candidate = sLS - e.lag + dur(id);
            break;
          case "FF":
            candidate = sLF - e.lag;
            break;
          case "SF":
            candidate = sLF - e.lag + dur(id);
            break;
          case "FS":
          default:
            candidate = sLS - e.lag;
            break;
        }
        if (candidate < lf) lf = candidate;
      }
    }
    if (!Number.isFinite(lf)) lf = projectDuration;
    LF.set(id, lf);
    LS.set(id, lf - dur(id));
  }

  // ---- Assemble per-task results + float. ----
  // Small epsilon to absorb integer rounding when comparing floats to zero.
  const CRITICAL_THRESHOLD = 0;
  const results: CpmTaskResult[] = tasks.map((t) => {
    const d = duration.get(t.id)!;
    const es = ES.get(t.id) ?? 0;
    const ef = EF.get(t.id) ?? es;
    const ls = LS.get(t.id) ?? es;
    const lf = LF.get(t.id) ?? ef;
    const float = ls - es;
    const cyclic = inCycle.has(t.id);
    return {
      id: t.id,
      externalId: t.externalId,
      title: t.title,
      status: t.status,
      percentComplete: t.percentComplete,
      workstreamName: t.workstreamName,
      flaggedCritical: t.flaggedCritical,
      durationDays: d.days,
      durationSource: d.source,
      hasDuration: d.source !== "none",
      earlyStart: es,
      earlyFinish: ef,
      lateStart: ls,
      lateFinish: lf,
      totalFloat: float,
      // Tasks on a cycle can't be reliably scheduled, so don't label critical.
      isCritical: !cyclic && float <= CRITICAL_THRESHOLD,
      inCycle: cyclic,
    };
  });

  const resultById = new Map(results.map((r) => [r.id, r]));

  // ---- Build the ordered critical chain (longest critical path). ----
  const criticalChain = buildCriticalChain(results, schedEdges, resultById);

  // ---- Cycle labels. ----
  const cycleObjs: CpmCycle[] = cycles.map((path) => ({
    taskIds: path,
    labels: path.map((id) => {
      const t = taskById.get(id);
      return t ? (t.externalId ? `${t.externalId} ${t.title}` : t.title) : id;
    }),
  }));

  // ---- Summary. ----
  const computedCritical = results.filter((r) => r.isCritical).length;
  const flaggedCritical = results.filter((r) => r.flaggedCritical).length;
  const flagMismatch = results.filter(
    (r) => r.isCritical !== r.flaggedCritical,
  ).length;
  const undated = results.filter((r) => !r.hasDuration).length;

  return {
    tasks: results,
    criticalChain,
    cycles: cycleObjs,
    projectDurationDays: projectDuration,
    summary: {
      totalTasks: results.length,
      scheduledTasks: results.length - undated,
      undatedTasks: undated,
      computedCritical,
      flaggedCritical,
      flagMismatch,
      cycleCount: cycleObjs.length,
    },
  };
}

/**
 * Trace the longest chain of critical tasks following dependency edges. Starts
 * from critical tasks with no critical predecessor and walks forward, choosing
 * the successor that ends latest, to yield a single representative chain.
 */
function buildCriticalChain(
  results: CpmTaskResult[],
  edges: Edge[],
  resultById: Map<string, CpmTaskResult>,
): CpmTaskResult[] {
  const critical = new Set(
    results.filter((r) => r.isCritical).map((r) => r.id),
  );
  if (critical.size === 0) return [];

  const criticalSuccs = new Map<string, string[]>();
  const hasCriticalPred = new Set<string>();
  for (const e of edges) {
    if (!critical.has(e.from) || !critical.has(e.to)) continue;
    if (!criticalSuccs.has(e.from)) criticalSuccs.set(e.from, []);
    criticalSuccs.get(e.from)!.push(e.to);
    hasCriticalPred.add(e.to);
  }

  // Memoised longest-path (by node count then earliest ES) from each start.
  const memo = new Map<string, string[]>();
  const visiting = new Set<string>();
  function longestFrom(id: string): string[] {
    if (memo.has(id)) return memo.get(id)!;
    if (visiting.has(id)) return [id]; // defensive: shouldn't happen (acyclic)
    visiting.add(id);
    let best: string[] = [];
    for (const next of criticalSuccs.get(id) ?? []) {
      const tail = longestFrom(next);
      if (tail.length > best.length) best = tail;
    }
    visiting.delete(id);
    const path = [id, ...best];
    memo.set(id, path);
    return path;
  }

  const starts = [...critical].filter((id) => !hasCriticalPred.has(id));
  const candidates = starts.length > 0 ? starts : [...critical];

  let chain: string[] = [];
  for (const start of candidates) {
    const path = longestFrom(start);
    if (path.length > chain.length) chain = path;
  }

  // Order by early start as a tiebreak for readability.
  return chain
    .map((id) => resultById.get(id))
    .filter((r): r is CpmTaskResult => Boolean(r));
}

/**
 * Load tasks + dependencies from the DB and run the CPM computation. Returns an
 * empty-but-valid result when the Task table isn't present.
 */
export async function getCpm(): Promise<CpmResult> {
  const exists = await hasTable("TaskDependency");
  if (!exists) {
    return {
      tasks: [],
      criticalChain: [],
      cycles: [],
      projectDurationDays: 0,
      summary: {
        totalTasks: 0,
        scheduledTasks: 0,
        undatedTasks: 0,
        computedCritical: 0,
        flaggedCritical: 0,
        flagMismatch: 0,
        cycleCount: 0,
      },
    };
  }

  const [tasks, dependencies] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ sortOrder: "asc" }, { externalId: "asc" }],
      select: {
        id: true,
        externalId: true,
        title: true,
        status: true,
        percentComplete: true,
        criticalPath: true,
        baselineStartDate: true,
        baselineEndDate: true,
        forecastStartDate: true,
        forecastEndDate: true,
        durationDays: true,
        workstream: { select: { name: true } },
      },
    }),
    prisma.taskDependency.findMany({
      select: {
        id: true,
        predecessorTaskId: true,
        successorTaskId: true,
        dependencyType: true,
        lagDays: true,
      },
    }),
  ]);

  const taskInputs: CpmTaskInput[] = tasks.map((t) => ({
    id: t.id,
    externalId: t.externalId,
    title: t.title,
    status: t.status,
    percentComplete: t.percentComplete,
    flaggedCritical: t.criticalPath,
    baselineStartDate: t.baselineStartDate,
    baselineEndDate: t.baselineEndDate,
    forecastStartDate: t.forecastStartDate,
    forecastEndDate: t.forecastEndDate,
    durationDays: t.durationDays,
    workstreamName: t.workstream?.name ?? null,
  }));

  const depInputs: CpmDependencyInput[] = dependencies.map((d) => ({
    id: d.id,
    predecessorTaskId: d.predecessorTaskId,
    successorTaskId: d.successorTaskId,
    dependencyType: d.dependencyType,
    lagDays: d.lagDays,
  }));

  return computeCpm(taskInputs, depInputs);
}
