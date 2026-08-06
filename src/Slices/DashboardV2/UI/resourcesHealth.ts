import { Resource } from "@/Core/Domain/Resource";
import { words } from "@/UI/words";
import { HealthStatus } from "./Components/EnvironmentHealth/StatusIndicator";

export interface ResourcesHealth {
  status: HealthStatus;
  statLines: string[];
}

/**
 * "Failed to deploy" is mapped to resourceSummary.lastHandlerRun.failed — a handler execution
 * failure is the most direct read of that phrase. Severity stays keyed off that count alone;
 * the total resource count and non-compliant count are shown as extra context, not additional
 * severity triggers.
 */
export const deriveResourcesHealth = (summary: Resource.ResourceSummary): ResourcesHealth => {
  const failedCount = summary.lastHandlerRun.failed;

  return {
    status: failedCount > 0 ? "attention" : "healthy",
    statLines: words("dashboardV2.environmentHealth.resourcesSummary")(
      summary.totalCount,
      failedCount,
      summary.compliance.non_compliant
    ),
  };
};
