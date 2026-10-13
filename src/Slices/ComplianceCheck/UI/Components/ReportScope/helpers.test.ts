import { ServiceInstanceModel } from "@/Core";
import { ResourceActionFilter } from "@/Data/Queries";
import { ServiceInstance } from "@/Test";
import { words } from "@/UI/words";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import * as DesiredStateMock from "@S/DesiredState/Data/Mock";
import {
  getKnownStatus,
  getModelVersionLookup,
  getRerunFilter,
  getScopeLabel,
  getScopeRows,
  getValueText,
  isNotActiveVersion,
} from "./helpers";

const modelVersion = 5;
const instance: ServiceInstanceModel = ServiceInstance.a;
const instances = { [instance.id]: instance };
const instanceName = instance.service_identity_attribute_value ?? instance.id;

const versionRow = getScopeRows({ isOrphan: false }, modelVersion, {});

describe("getScopeRows", () => {
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

    expect(getScopeRows(filter, modelVersion, instances)).toEqual([
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
      { key: "status", values: [{ value: "non compliant", operator: "neq" }] },
    ]);
  });

  it("shows only what the filter holds, and an instance by id until it is looked up", () => {
    expect(getScopeRows({ serviceInstance: [instance.id] }, modelVersion, {})).toEqual([
      { key: "serviceInstance", values: [{ value: instance.id, kind: "serviceInstance" }] },
    ]);
    // The instance's service entity isn't in the filter, so it isn't shown.
    expect(getScopeRows({ serviceInstance: [instance.id] }, modelVersion, instances)).toEqual([
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
    expect(getScopeRows({ instanceVersion: 3 }, modelVersion, {})).toEqual([
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
    getScopeLabel(getScopeRows(filter, modelVersion, instances));

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
    const agent = words("desiredState.complianceCheck.scope.row.agent").toLowerCase();
    const type = words("desiredState.complianceCheck.scope.row.resourceType").toLowerCase();

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

describe("getModelVersionLookup", () => {
  const [desiredStateVersion] = DesiredStateMock.response.data;

  it.each`
    description             | data                                                                     | isError  | lookup
    ${"still loading"}      | ${undefined}                                                             | ${false} | ${"loading"}
    ${"failed"}             | ${undefined}                                                             | ${true}  | ${"failed"}
    ${"no longer existing"} | ${null}                                                                  | ${false} | ${"missing"}
    ${"active"}             | ${{ ...desiredStateVersion, status: DesiredStateVersionStatus.active }}  | ${false} | ${DesiredStateVersionStatus.active}
    ${"retired"}            | ${{ ...desiredStateVersion, status: DesiredStateVersionStatus.retired }} | ${false} | ${DesiredStateVersionStatus.retired}
  `("reads a $description model version as $lookup", ({ data, isError, lookup }) => {
    expect(getModelVersionLookup({ data, isError })).toBe(lookup);
  });
});

describe("getKnownStatus", () => {
  it.each`
    lookup                               | status
    ${"loading"}                         | ${undefined}
    ${"failed"}                          | ${undefined}
    ${"missing"}                         | ${undefined}
    ${DesiredStateVersionStatus.retired} | ${DesiredStateVersionStatus.retired}
  `("is $status for $lookup", ({ lookup, status }) => {
    expect(getKnownStatus(lookup)).toBe(status);
  });
});

describe("isNotActiveVersion", () => {
  it.each`
    lookup                                 | isNotActive
    ${"loading"}                           | ${false}
    ${"failed"}                            | ${false}
    ${DesiredStateVersionStatus.active}    | ${false}
    ${"missing"}                           | ${true}
    ${DesiredStateVersionStatus.retired}   | ${true}
    ${DesiredStateVersionStatus.candidate} | ${true}
  `("is $isNotActive for $lookup", ({ lookup, isNotActive }) => {
    expect(isNotActiveVersion(lookup)).toBe(isNotActive);
  });
});

describe("getRerunFilter", () => {
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
    expect(getRerunFilter(filter, 3, isActiveVersion)).toEqual({ filter });
  });

  it("sets the report's model version once that version is no longer active", () => {
    expect(getRerunFilter(activeVersionFilter, 3, false)).toEqual({
      filter: { agent: { eq: ["internal"] }, modelVersion: 3 },
    });
  });

  it("is blocked when the filter can't target an older model version", () => {
    const filter: ResourceActionFilter = { isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } };

    expect(getRerunFilter(filter, 3, false)).toEqual({ blockedBy: "statusFilter" });
  });
});
