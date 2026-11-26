import { ResourceActionFilter } from "@inmanta/web-console-core";
import { createReportScopeDryRunPlan } from "./helpers";

describe("createReportScopeDryRunPlan", () => {
  const activeVersionFilter: ResourceActionFilter = {
    isOrphan: false,
    agent: { eq: ["internal"] },
  };

  it.each`
    description                                       | filter                                            | isActiveVersion
    ${"a filter with a model version"}                | ${{ modelVersion: 3, agent: { eq: ["a"] } }}      | ${false}
    ${"a filter with an instance version"}            | ${{ instanceVersion: 2, serviceInstance: ["i"] }} | ${false}
    ${"an active model version filter, still active"} | ${activeVersionFilter}                            | ${true}
  `("posts $description as is", ({ filter, isActiveVersion }) => {
    expect(createReportScopeDryRunPlan(filter, 3, isActiveVersion)).toEqual({
      kind: "ready",
      filter,
    });
  });

  it("sets the report's model version once that version is no longer active", () => {
    expect(createReportScopeDryRunPlan(activeVersionFilter, 3, false)).toEqual({
      kind: "ready",
      filter: { agent: { eq: ["internal"] }, modelVersion: 3 },
    });
  });

  it("is blocked when the filter can't target an older model version", () => {
    const filter: ResourceActionFilter = { isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } };

    expect(createReportScopeDryRunPlan(filter, 3, false)).toEqual({
      kind: "blocked",
      blockedBy: "statusFilter",
    });
  });
});
