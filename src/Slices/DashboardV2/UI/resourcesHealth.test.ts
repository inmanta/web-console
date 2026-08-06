import { createMockResourceSummary } from "@/Test/Data/Resource";
import { words } from "@/UI/words";
import { deriveResourcesHealth } from "./resourcesHealth";

describe("deriveResourcesHealth", () => {
  it("is healthy with total/failed/non-compliant stat lines when nothing failed to deploy", () => {
    const summary = createMockResourceSummary({
      totalCount: 106,
      lastHandlerRun: { successful: 5, new: 0, failed: 0, skipped: 1 },
      compliance: { compliant: 5, has_update: 0, non_compliant: 1, undefined: 0 },
    });

    const health = deriveResourcesHealth(summary);

    expect(health.status).toEqual("healthy");
    expect(health.statLines).toEqual(
      words("dashboardV2.environmentHealth.resourcesSummary")(106, 0, 1)
    );
  });

  it("is in attention with total/failed/non-compliant stat lines when something failed to deploy", () => {
    const summary = createMockResourceSummary({
      totalCount: 106,
      lastHandlerRun: { successful: 4, new: 0, failed: 2, skipped: 0 },
      compliance: { compliant: 4, has_update: 0, non_compliant: 3, undefined: 0 },
    });

    const health = deriveResourcesHealth(summary);

    expect(health.status).toEqual("attention");
    expect(health.statLines).toEqual(
      words("dashboardV2.environmentHealth.resourcesSummary")(106, 2, 3)
    );
  });
});
