import { Resource, ResourceActionFilter } from "@/Core";
import { createDryRunContext, getVersionSelectionBlocker } from "./helpers";

describe("createDryRunContext", () => {
  it("keeps the labels of the filter's instances only, and labels an unknown one by its id", () => {
    expect(
      createDryRunContext({ serviceInstance: ["abc", "def"] }, { abc: "cpe-1", xyz: "cpe-9" })
    ).toEqual({ web_instance_labels: { abc: "cpe-1", def: "def" } });
  });

  it("has no labels for a filter without instances", () => {
    expect(createDryRunContext({ isOrphan: false }, { abc: "cpe-1" })).toEqual({
      web_instance_labels: {},
    });
  });
});

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
