import { Resource } from "@/Core/Domain/Resource";
import { words } from "@/UI/words";
import { HealthStatus } from "./Components/StatusIndicator";

export interface ResourcesHealth {
  status: HealthStatus;
  statLine: string;
}

/**
 * "Failed to deploy" is mapped to resourceSummary.lastHandlerRun.failed — a handler execution
 * failure is the most direct read of that phrase (see documentation/7136-plan.md open question #2).
 */
export const deriveResourcesHealth = (summary: Resource.ResourceSummary): ResourcesHealth => {
  const failedCount = summary.lastHandlerRun.failed;

  return {
    status: failedCount > 0 ? "attention" : "healthy",
    statLine: words("dashboardV2.environmentHealth.resourcesSummary")(failedCount),
  };
};
