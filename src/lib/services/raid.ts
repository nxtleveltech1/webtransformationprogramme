import { getRisks, type RiskRow } from "@/lib/services/risks";
import { getIssues, type IssueRow } from "@/lib/services/issues";
import {
  getDependencies,
  type DependencyRow,
} from "@/lib/services/dependencies";
import {
  getAssumptions,
  type AssumptionRow,
} from "@/lib/services/assumptions";

export type RaidData = {
  risks: RiskRow[];
  issues: IssueRow[];
  dependencies: DependencyRow[];
  assumptions: AssumptionRow[];
};

export async function getRaidData(): Promise<RaidData> {
  const [risks, issues, dependencies, assumptions] = await Promise.all([
    getRisks(),
    getIssues(),
    getDependencies(),
    getAssumptions(),
  ]);
  return { risks, issues, dependencies, assumptions };
}
