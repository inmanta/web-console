import { Diff, ResourceActionFilter, ServiceInstanceModel } from "@/Core";
import { ServiceInstance } from "@/Test";
import { words } from "@/UI/words";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import * as DesiredStateMock from "@S/DesiredState/Data/Mock";
import {
  countDiff,
  getFilterRows,
  getModelVersionState,
  getRerunPlan,
  getScopeLabel,
  getValueText,
} from "./helpers";

const modelVersion = 5;
const instance: ServiceInstanceModel = ServiceInstance.a;
const instances = { [instance.id]: instance };
const instanceName = instance.service_identity_attribute_value ?? instance.id;

const versionRow = getFilterRows({ isOrphan: false }, modelVersion, {});

describe("getFilterRows", () => {
  it("groups the filter into service, instance, agent, type, value, version and status rows", () => {
    const filter: ResourceActionFilter = {
      compliance: { neq: ["NON_COMPLIANT"] },
      isOrphan: false,
      agent: { eq: ["internal"] },
      resourceType: { contains: ["%File%"] },
      includeOwned: true,
      serviceEntity: ["l2Connect"],
      serviceInstance: [instance.id],
    };

    expect(getFilterRows(filter, modelVersion, instances)).toEqual([
      { key: "serviceEntity", values: [{ value: "l2Connect", kind: "serviceEntity" }] },
      {
        key: "serviceInstance",
        values: [
          { value: instanceName, kind: "serviceInstance" },
          { value: words("desiredState.complianceCheck.scope.value.owned"), kind: "includeOwned" },
        ],
      },
      { key: "agent", values: [{ value: "internal" }] },
      { key: "resourceType", values: [{ value: "File", operator: "contains" }] },
      ...versionRow,
      {
        key: "status",
        termNote: words("desiredState.complianceCheck.scope.row.status.note"),
        isApart: true,
        values: [{ value: "non compliant", operator: "neq" }],
      },
    ]);
  });

  it("shows only what the filter holds, and an instance by id until it is looked up", () => {
    expect(getFilterRows({ serviceInstance: [instance.id] }, modelVersion, {})).toEqual([
      { key: "serviceInstance", values: [{ value: instance.id, kind: "serviceInstance" }] },
    ]);
    // The instance's service entity isn't in the filter, so it isn't shown.
    expect(getFilterRows({ serviceInstance: [instance.id] }, modelVersion, instances)).toEqual([
      { key: "serviceInstance", values: [{ value: instanceName, kind: "serviceInstance" }] },
    ]);
  });

  it("shows the active model version as latest intent, without orphans", () => {
    expect(versionRow).toEqual([
      {
        key: "version",
        values: [
          { value: words("modelVersion")(modelVersion) },
          {
            value: words("desiredState.complianceCheck.scope.value.latestIntent"),
            kind: "latestIntent",
          },
        ],
        note: words("desiredState.complianceCheck.scope.value.excludesOrphans"),
      },
    ]);
  });

  it("shows an instance version next to the model version it ran on", () => {
    expect(getFilterRows({ instanceVersion: 3 }, modelVersion, {})).toEqual([
      {
        key: "version",
        values: [
          { value: words("instanceVersion")(3) },
          { value: words("modelVersion")(modelVersion) },
        ],
      },
    ]);
  });
});

describe("getValueText", () => {
  it("prefixes the operator", () => {
    expect(getValueText({ value: "File", operator: "contains" })).toBe(
      words("desiredState.complianceCheck.scope.operator.contains")("File")
    );
    expect(getValueText({ value: "internal" })).toBe("internal");
  });
});

describe("getScopeLabel", () => {
  const labelOf = (filter: ResourceActionFilter) =>
    getScopeLabel(getFilterRows(filter, modelVersion, instances));

  it("reads Full model when the filter only picks a version", () => {
    expect(labelOf({ isOrphan: false })).toBe(
      words("desiredState.complianceCheck.scope.fullModel")
    );
  });

  it("leads with the service anchor and collapses the rest", () => {
    expect(
      labelOf({
        isOrphan: false,
        serviceInstance: [instance.id],
        includeOwned: true,
        agent: { eq: ["a", "b"] },
      })
    ).toBe(`${instanceName} ${words("desiredState.complianceCheck.scope.label.owned")} +2`);
    expect(
      labelOf({ isOrphan: false, serviceEntity: ["l2Connect"], serviceInstance: [instance.id] })
    ).toBe(`l2Connect › ${instanceName}`);
  });

  it("shows a single condition whole", () => {
    const agent = words("desiredState.complianceCheck.scope.row.agent");
    const type = words("desiredState.complianceCheck.scope.row.resourceType");

    expect(labelOf({ isOrphan: false, agent: { eq: ["router-east"] } })).toBe(
      `${agent} = router-east`
    );
    expect(labelOf({ isOrphan: false, resourceType: { contains: ["%File%"] } })).toBe(
      `${type} ${words("desiredState.complianceCheck.scope.operator.contains")("File")}`
    );
  });

  it("counts the conditions when there is no anchor", () => {
    expect(
      labelOf({ isOrphan: false, agent: { eq: ["a"] }, compliance: { eq: ["NON_COMPLIANT"] } })
    ).toBe(words("desiredState.complianceCheck.scope.label.conditions")(2));
  });
});

describe("getModelVersionState", () => {
  const [desiredStateVersion] = DesiredStateMock.response.data;
  const retiredVersion = { ...desiredStateVersion, status: DesiredStateVersionStatus.retired };

  it.each`
    description                                  | data              | isError  | state
    ${"still loading"}                           | ${undefined}      | ${false} | ${{ state: "loading" }}
    ${"failed"}                                  | ${undefined}      | ${true}  | ${{ state: "failed" }}
    ${"no longer existing"}                      | ${null}           | ${false} | ${{ state: "missing" }}
    ${"known"}                                   | ${retiredVersion} | ${false} | ${{ state: "known", status: DesiredStateVersionStatus.retired }}
    ${"known from before a failed later lookup"} | ${retiredVersion} | ${true}  | ${{ state: "known", status: DesiredStateVersionStatus.retired }}
  `("reads a $description model version", ({ data, isError, state }) => {
    expect(getModelVersionState({ data, isError })).toEqual(state);
  });
});

describe("countDiff", () => {
  const resource = (resourceId: string, status: Diff.Status): Diff.Resource => ({
    resource_id: resourceId,
    attributes: {},
    status,
  });

  it("counts the distinct agents and the added, modified and deleted resources", () => {
    expect(
      countDiff([
        resource("std::File[agent-a,path=/a]", "added"),
        resource("std::File[agent-a,path=/b]", "modified"),
        resource("std::File[agent-b,path=/c]", "deleted"),
        resource("std::File[agent-b,path=/d]", "unmodified"),
        resource("std::File[agent-c,path=/e]", "agent_down"),
      ])
    ).toEqual({ agentCount: 3, changedCount: 3 });
  });

  it("counts nothing in an empty diff", () => {
    expect(countDiff([])).toEqual({ agentCount: 0, changedCount: 0 });
  });
});

describe("getRerunPlan", () => {
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
    expect(getRerunPlan(filter, 3, isActiveVersion)).toEqual({ kind: "ready", filter });
  });

  it("sets the report's model version once that version is no longer active", () => {
    expect(getRerunPlan(activeVersionFilter, 3, false)).toEqual({
      kind: "ready",
      filter: { agent: { eq: ["internal"] }, modelVersion: 3 },
    });
  });

  it("is blocked when the filter can't target an older model version", () => {
    const filter: ResourceActionFilter = { isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } };

    expect(getRerunPlan(filter, 3, false)).toEqual({ kind: "blocked", blockedBy: "statusFilter" });
  });
});
