import { revalidatePath } from "next/cache";

/** Invalidate views that read Workstream rows or their rollup counts. */
export function revalidateWorkstreamViews(
  ...workstreamIds: (string | null | undefined)[]
) {
  revalidatePath("/workstreams");
  revalidatePath("/dashboard");
  revalidatePath("/programme");
  revalidatePath("/reports");
  revalidatePath("/wbs");

  const seen = new Set<string>();
  for (const id of workstreamIds) {
    if (id && !seen.has(id)) {
      seen.add(id);
      revalidatePath(`/workstreams/${id}`);
    }
  }
}

export function revalidateProjectViews(
  projectId: string,
  ...workstreamIds: (string | null | undefined)[]
) {
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidateWorkstreamViews(...workstreamIds);
}
