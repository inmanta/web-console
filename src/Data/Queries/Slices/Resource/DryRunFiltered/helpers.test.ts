import { Resource } from "@/Core/Domain";
import { ResourceActionFilter } from "../ResourceActionFilter";
import { getVersionSelectionBlocker } from "./helpers";

describe("getVersionSelectionBlocker", () => {
  it.each<[string, ResourceActionFilter]>([
    ["isOrphan: true", { isOrphan: true }],
    ["isDeploying", { isOrphan: false, isDeploying: false }],
    ["blocked", { isOrphan: false, blocked: { eq: [Resource.BLOCKED.blocked] } }],
    ["compliance", { isOrphan: false, compliance: { eq: [Resource.COMPLIANCE.compliant] } }],
    [
      "lastHandlerRun",
      { isOrphan: false, lastHandlerRun: { eq: [Resource.LAST_HANDLER_RUN.failed] } },
    ],
  ])("blocks selecting a version for a filter on the current status (%s)", (_field, filter) => {
    expect(getVersionSelectionBlocker(filter)).toBe("statusFilter");
  });

  it("blocks selecting a version for owned services, also next to a status filter", () => {
    expect(
      getVersionSelectionBlocker({
        isOrphan: false,
        serviceInstance: ["abc"],
        includeOwned: true,
        compliance: { eq: [Resource.COMPLIANCE.compliant] },
      })
    ).toBe("ownedServices");
  });

  it("lets a filter on the active model version or on identity fields select any version", () => {
    expect(
      getVersionSelectionBlocker({
        isOrphan: false,
        agent: { eq: ["internal"] },
        serviceInstance: ["abc"],
      })
    ).toBeUndefined();
  });
});
