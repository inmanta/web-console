import { Diff, ResourceActionFilter, words } from "@inmanta/web-console-core";
import { DesiredStateVersionStatus } from "@inmanta/web-console-core/Domain/DesiredStateVersion";
import * as Mock from "@inmanta/web-console-feature-orchestration-engine/Slices/ComplianceCheck/Data/Mock";
import { ServiceInstance } from "@inmanta/web-console-test-utils";
import {
  countDiff,
  createFilterRows,
  createReportScopeParts,
  createRerunPlan,
  createStatusValues,
  createVersionValues,
  formatFilterValue,
  formatScopeLabel,
  getReportInstanceLabels,
} from "./helpers";

const modelVersion = 5;
const instance = ServiceInstance.a;
const instanceLabel = Mock.filteredInstanceLabel;
const instanceLabels = { [instance.id]: instanceLabel };

describe("getReportInstanceLabels", () => {
  it("reads the instance labels the web-console stored in the context", () => {
    expect(
      getReportInstanceLabels({ ...Mock.a, context: { web_instance_labels: instanceLabels } })
    ).toEqual(instanceLabels);
  });

  it("has no labels for a report without the web-console's context", () => {
    const { context: _context, ...reportWithoutContext } = Mock.a;

    expect(getReportInstanceLabels(reportWithoutContext)).toEqual({});
    expect(getReportInstanceLabels({ ...Mock.a, context: null })).toEqual({});
    expect(getReportInstanceLabels({ ...Mock.a, context: {} })).toEqual({});
  });

  it.each`
    description   | contextInstanceLabels
    ${"a string"} | ${"cpe-1"}
    ${"an array"} | ${["cpe-1"]}
    ${"a number"} | ${7}
  `(
    "has no labels when another client stored $description as instance labels",
    ({ contextInstanceLabels }) => {
      expect(
        getReportInstanceLabels({
          ...Mock.a,
          context: { web_instance_labels: contextInstanceLabels },
        })
      ).toEqual({});
    }
  );

  it("keeps only the labels that are strings", () => {
    expect(
      getReportInstanceLabels({
        ...Mock.a,
        context: {
          web_instance_labels: { ...instanceLabels, def: { name: "cpe-2" }, ghi: 7, jkl: null },
        },
      })
    ).toEqual(instanceLabels);
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

    expect(createFilterRows(filter, instanceLabels)).toEqual([
      { key: "serviceEntity", values: [{ value: "l2Connect", kind: "serviceEntity" }] },
      {
        key: "serviceInstance",
        values: [
          { value: instanceLabel, kind: "serviceInstance" },
          { value: words("desiredState.complianceCheck.scope.value.owned"), kind: "includeOwned" },
        ],
      },
      { key: "agent", values: [{ value: "internal" }] },
      { key: "resourceType", values: [{ value: "File", operator: "contains" }] },
    ]);
  });

  it("shows only what the filter holds, and an instance by id when it has no stored label", () => {
    expect(createFilterRows({ serviceInstance: [instance.id] }, {})).toEqual([
      { key: "serviceInstance", values: [{ value: instance.id, kind: "serviceInstance" }] },
    ]);
    expect(createFilterRows({ serviceInstance: [instance.id] }, instanceLabels)).toEqual([
      { key: "serviceInstance", values: [{ value: instanceLabel, kind: "serviceInstance" }] },
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
    formatScopeLabel(createFilterRows(filter, instanceLabels), createStatusValues(filter));

  it("leads with the service anchor and collapses the rest", () => {
    expect(
      labelOf({
        isOrphan: false,
        serviceInstance: [instance.id],
        includeOwned: true,
        agent: { eq: ["a", "b"] },
      })
    ).toBe(`${instanceLabel} ${words("desiredState.complianceCheck.scope.label.owned")} +2`);
    expect(
      labelOf({ isOrphan: false, serviceEntity: ["l2Connect"], serviceInstance: [instance.id] })
    ).toBe(`l2Connect › ${instanceLabel}`);
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

describe("createReportScopeParts", () => {
  const fullModelScope = {
    rows: [],
    statusValues: [],
    isFiltered: false,
    label: words("desiredState.complianceCheck.scope.fullModel"),
  };

  it("reads Full model for a dry run on the whole model version", () => {
    expect(createReportScopeParts({ ...Mock.a, resource_filter: null })).toEqual(fullModelScope);
  });

  it("reads Full model when the filter only picks a version", () => {
    expect(createReportScopeParts({ ...Mock.a, resource_filter: { isOrphan: false } })).toEqual(
      fullModelScope
    );
  });

  it("shows the instances by the labels stored with the report", () => {
    expect(
      createReportScopeParts({
        ...Mock.a,
        resource_filter: { isOrphan: false, serviceInstance: [instance.id] },
        context: { web_instance_labels: instanceLabels },
      })
    ).toEqual({
      rows: [
        { key: "serviceInstance", values: [{ value: instanceLabel, kind: "serviceInstance" }] },
      ],
      statusValues: [],
      isFiltered: true,
      label: instanceLabel,
    });
  });

  it("counts a filter with only status conditions as filtered", () => {
    expect(
      createReportScopeParts({
        ...Mock.a,
        resource_filter: { isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } },
      })
    ).toEqual({
      rows: [],
      statusValues: [{ value: "non compliant" }],
      isFiltered: true,
      label: `${words("desiredState.complianceCheck.scope.row.status")} = non compliant`,
    });
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
