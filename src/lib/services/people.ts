import { getStakeholderDirectorySummary } from "@/lib/services/stakeholder-directory";

export type PersonWithRelations = Awaited<
  ReturnType<typeof getStakeholderDirectorySummary>
>["people"][number];

export type TeamWithMembers = Awaited<
  ReturnType<typeof getStakeholderDirectorySummary>
>["teams"][number];

export async function getPeopleData() {
  return getStakeholderDirectorySummary();
}
