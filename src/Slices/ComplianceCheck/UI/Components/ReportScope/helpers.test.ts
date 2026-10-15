import { Diff, ResourceActionFilter, ServiceInstanceModel } from "@/Core";
import { ServiceInstance } from "@/Test";
import { words } from "@/UI/words";
import * as Mock from "@S/ComplianceCheck/Data/Mock";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import {
  countDiff,
  createFilterRows,
  createInstanceIdLookup,
  createRerunPlan,
  createStatusValues,
  createVersionValues,
  formatFilterValue,
  formatScopeLabel,
} from "./helpers";

const modelVersion = 5;
const instance: ServiceInstanceModel = ServiceInstance.a;
const instances = { [instance.id]: instance };
const instanceName = instance.service_identity_attribute_value ?? instance.id;

describe("createInstanceIdLookup", () => {
  const reportWith = (resource_filter: ResourceActionFilter) => ({ ...Mock.a, resource_filter });

  it("groups the instances of all reports under their entities, each id once", () => {
    expect(
      createInstanceIdLookup([
        reportWith({ serviceEntity: ["lab"], serviceInstance: ["b", "a"] }),
        reportWith({ serviceEntity: ["lab"], serviceInstance: ["a", "c"] }),
        reportWith({ serviceEntity: ["vlan"], serviceInstance: ["d"] }),
      ])
    ).toEqual({ byEntity: { lab: ["a", "b", "c"], vlan: ["d"] }, withoutEntity: [] });
  });

  it("looks up instances without an entity on their own, unless another report groups them", () => {
    expect(
      createInstanceIdLookup([
        reportWith({ serviceInstance: ["b", "a"] }),
        reportWith({ serviceEntity: ["lab"], serviceInstance: ["a"] }),
      ])
    ).toEqual({ byEntity: { lab: ["a"] }, withoutEntity: ["b"] });
  });

  it("looks up nothing for reports without instances", () => {
    expect(createInstanceIdLookup([Mock.a, reportWith({ serviceEntity: ["lab"] })])).toEqual({
      byEntity: {},
      withoutEntity: [],
    });
  });
});

describe("createFilterRows", () => {
  it("groups the filter into service, instance, agent and type rows, without version and status", () => {
    const filter: ResourceActionFilter = {
      compliance: { neq: ["NON_COMPLIANT"] },
      isOrphan: false,
      agent: { eq: ["internal"] },
      resourceType: { contains: ["%File%"] },
      includeOwned: true,
      serviceEntity: ["l2Connect"],
      serviceInstance: [instance.id],
    };

    expect(createFilterRows(filter, instances)).toEqual([
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
    ]);
  });

  it("shows only what the filter holds, and an instance by id until it is looked up", () => {
    expect(createFilterRows({ serviceInstance: [instance.id] }, {})).toEqual([
      { key: "serviceInstance", values: [{ value: instance.id, kind: "serviceInstance" }] },
    ]);
    // The instance's service entity isn't in the filter, so it isn't shown.
    expect(createFilterRows({ serviceInstance: [instance.id] }, instances)).toEqual([
      { key: "serviceInstance", values: [{ value: instanceName, kind: "serviceInstance" }] },
    ]);
  });

  it("keeps a contains pattern that the console didn't wrap in % as is", () => {
    expect(createFilterRows({ resourceIdValue: { contains: ["File%"] } }, {})).toEqual([
      { key: "resourceIdValue", values: [{ value: "File%", operator: "contains" }] },
    ]);
  });
});

describe("createVersionValues", () => {
  const modelVersionValue = { value: words("modelVersion")(modelVersion) };

  it.each`
    description            | modelVersionStatus
    ${"active"}            | ${DesiredStateVersionStatus.active}
    ${"not looked up yet"} | ${undefined}
  `(
    "shows latest intent as a flag while the model version is $description",
    ({ modelVersionStatus }) => {
      expect(createVersionValues({ isOrphan: false }, modelVersion, modelVersionStatus)).toEqual([
        modelVersionValue,
        {
          value: words("desiredState.complianceCheck.scope.value.latestIntent"),
          kind: "latestIntent",
        },
      ]);
    }
  );

  it("shows that it was latest intent once the model version is not active", () => {
    expect(
      createVersionValues({ isOrphan: false }, modelVersion, DesiredStateVersionStatus.retired)
    ).toEqual([
      modelVersionValue,
      { value: words("desiredState.complianceCheck.scope.value.wasLatestIntent") },
    ]);
  });

  it("shows an instance version next to the model version it ran on", () => {
    expect(
      createVersionValues({ instanceVersion: 3 }, modelVersion, DesiredStateVersionStatus.active)
    ).toEqual([{ value: words("instanceVersion")(3) }, modelVersionValue]);
  });

  it("shows nothing when the filter doesn't pick a version", () => {
    expect(
      createVersionValues({ agent: { eq: ["a"] } }, modelVersion, DesiredStateVersionStatus.active)
    ).toEqual([]);
  });
});

describe("createStatusValues", () => {
  it("collects the conditions on the resources' status", () => {
    expect(
      createStatusValues({
        compliance: { neq: ["NON_COMPLIANT"] },
        isDeploying: true,
        isOrphan: true,
        agent: { eq: ["internal"] },
      })
    ).toEqual([
      { value: "non compliant", operator: "neq" },
      { value: words("desiredState.complianceCheck.scope.value.isDeploying.true") },
      { value: words("desiredState.complianceCheck.scope.value.orphansOnly") },
    ]);
  });
});

describe("formatFilterValue", () => {
  it("prefixes the operator", () => {
    expect(formatFilterValue({ value: "File", operator: "contains" })).toBe(
      words("desiredState.complianceCheck.scope.operator.contains")("File")
    );
    expect(formatFilterValue({ value: "internal" })).toBe("internal");
  });
});

describe("formatScopeLabel", () => {
  const labelOf = (filter: ResourceActionFilter) =>
    formatScopeLabel(createFilterRows(filter, instances), createStatusValues(filter));

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
    const status = words("desiredState.complianceCheck.scope.row.status");

    expect(labelOf({ isOrphan: false, agent: { eq: ["router-east"] } })).toBe(
      `${agent} = router-east`
    );
    expect(labelOf({ isOrphan: false, resourceType: { contains: ["%File%"] } })).toBe(
      `${type} ${words("desiredState.complianceCheck.scope.operator.contains")("File")}`
    );
    expect(labelOf({ isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } })).toBe(
      `${status} = non compliant`
    );
  });

  it("counts the conditions when there is no anchor", () => {
    expect(
      labelOf({ isOrphan: false, agent: { eq: ["a"] }, compliance: { eq: ["NON_COMPLIANT"] } })
    ).toBe(words("desiredState.complianceCheck.scope.label.conditions")(2));
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

describe("createRerunPlan", () => {
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
    expect(createRerunPlan(filter, 3, isActiveVersion)).toEqual({ kind: "ready", filter });
  });

  it("sets the report's model version once that version is no longer active", () => {
    expect(createRerunPlan(activeVersionFilter, 3, false)).toEqual({
      kind: "ready",
      filter: { agent: { eq: ["internal"] }, modelVersion: 3 },
    });
  });

  it("is blocked when the filter can't target an older model version", () => {
    const filter: ResourceActionFilter = { isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } };

    expect(createRerunPlan(filter, 3, false)).toEqual({
      kind: "blocked",
      blockedBy: "statusFilter",
    });
  });
});
