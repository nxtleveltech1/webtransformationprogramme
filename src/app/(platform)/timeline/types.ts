/**
 * Editable projections of the schedule entities plotted on the Gantt. The Gantt
 * renders a flattened `TimelineItem`; these shapes carry the full set of fields
 * the edit drawers need, looked up by id when a row is clicked.
 */

export interface WbsEditable {
  id: string;
  externalId: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  rag: string | null;
  percentComplete: number;
  baselineStartDate: string | null;
  baselineEndDate: string | null;
  forecastStartDate: string | null;
  forecastEndDate: string | null;
  durationDays: number | null;
  ownerPersonId: string | null;
  ownerText: string | null;
  workstreamId: string | null;
  blockers: string | null;
  acceptanceCriteria: string | null;
  criticalPath: boolean;
}

export interface MilestoneEditable {
  id: string;
  title: string;
  targetDate: string | null;
  piGate: string | null;
  status: string | null;
  varianceDays: number | null;
  notes: string | null;
  workstreamId: string | null;
  projectId: string | null;
}

export interface CriticalEditable {
  id: string;
  stepNumber: number;
  activity: string;
  ownerText: string | null;
  predecessor: string | null;
  dueDate: string | null;
  status: string | null;
  isCritical: boolean;
}

export interface ActivityEditable {
  id: string;
  workstream: string | null;
  activity: string;
  ownerText: string | null;
  startDate: string | null;
  endDate: string | null;
  dependency: string | null;
  status: string | null;
  notes: string | null;
}

export interface ScheduleEditOptions {
  people: { id: string; displayName: string }[];
  workstreams: { id: string; code: string; name: string }[];
  projects: { id: string; code: string | null; name: string }[];
}

/** All editable records, keyed by id, passed to the edit dialog dispatcher. */
export interface ScheduleEditData {
  wbs: Record<string, WbsEditable>;
  milestone: Record<string, MilestoneEditable>;
  critical: Record<string, CriticalEditable>;
  activity: Record<string, ActivityEditable>;
}
