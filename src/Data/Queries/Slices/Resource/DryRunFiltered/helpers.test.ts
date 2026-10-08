import { Resource } from "@/Core/Domain";
import { ResourceActionFilter } from "../ResourceActionFilter";
import { getVersionLock } from "./helpers";

describe("getVersionLock", () => {
  it.each<[string, ResourceActionFilter]>([
    ["isOrphan: true", { isOrphan: true }],
    ["isDeploying", { isOrphan: false, isDeploying: false }],
    ["blocked", { isOrphan: false, blocked: { eq: [Resource.BLOCKED.blocked] } }],
    ["compliance", { isOrphan: false, compliance: { eq: [Resource.COMPLIANCE.compliant] } }],
    [
      "lastHandlerRun",
      { isOrphan: false, lastHandlerRun: { eq: [Resource.LAST_HANDLER_RUN.failed] } },
    ],
  ])("locks a filter on the current status (%s)", (_field, filter) => {
    expect(getVersionLock(filter)).toBe("status");
  });

  it("locks owned services, also next to a status filter", () => {
    expect(
      getVersionLock({
        isOrphan: false,
        serviceInstance: ["abc"],
        includeOwned: true,
        compliance: { eq: [Resource.COMPLIANCE.compliant] },
      })
    ).toBe("owned");
  });

  it("leaves a filter on the latest version or on identity fields pinnable", () => {
    expect(
      getVersionLock({ isOrphan: false, agent: { eq: ["internal"] }, serviceInstance: ["abc"] })
    ).toBeUndefined();
  });
});
