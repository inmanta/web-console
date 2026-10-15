import { Diff, DryRun, Resource, ResourceActionFilter, StringMatch } from "@/Core";
import { getVersionSelectionBlocker, withDryRunVersion } from "@/Data/Queries/Slices/Resource";
import { InstanceIdLookup } from "@/Data/Queries/Slices/ServiceInstance";
import { words } from "@/UI/words";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { DiffCounts, FilterRow, FilterValue, InstancesById, RerunPlan } from "./types";

/**
 * Collects the service instances that the reports' filters name, to look them up in as few
 * requests as possible. Instances whose filter also names service entities are grouped under
 * those entities; the others, like a Resources page filter without an entity, are looked up on
 * their own, unless another report already groups them under an entity.
 *
 * @example createInstanceIdLookup([{ resource_filter: { serviceEntity: ["lab"], serviceInstance: ["b", "a"] }, ... }, { resource_filter: { serviceInstance: ["c"] }, ... }]) // { byEntity: { lab: ["a", "b"] }, withoutEntity: ["c"] }
 */
export const createInstanceIdLookup = (reports: DryRun[]): InstanceIdLookup => {
  const idsByEntity = new Map<string, Set<string>>();
  const idsWithoutEntity = new Set<string>();

  reports.forEach(({ resource_filter }) => {
    const instanceIds = resource_filter?.serviceInstance ?? [];
    const serviceEntities = resource_filter?.serviceEntity ?? [];

    if (serviceEntities.length === 0) {
      instanceIds.forEach((instanceId) => idsWithoutEntity.add(instanceId));

      return;
    }

    serviceEntities.forEach((serviceEntity) => {
      const ids = idsByEntity.get(serviceEntity) ?? new Set<string>();

      instanceIds.forEach((instanceId) => ids.add(instanceId));
      idsByEntity.set(serviceEntity, ids);
    });
  });

  const idsUnderEntity = new Set([...idsByEntity.values()].flatMap((ids) => [...ids]));

  return {
    byEntity: Object.fromEntries(
      [...idsByEntity]
        .filter(([, ids]) => ids.size > 0)
        .map(([serviceEntity, ids]) => [serviceEntity, [...ids].sort()])
    ),
    withoutEntity: [...idsWithoutEntity].filter((id) => !idsUnderEntity.has(id)).sort(),
  };
};

/**
 * Whether a value is a flag (owned services, latest intent) rather than a condition value.
 *
 * @example isFlag({ value: "owned", kind: "includeOwned" }) // true
 */
export const isFlag = ({ kind }: FilterValue): boolean =>
  kind === "includeOwned" || kind === "latestIntent";

/**
 * Whether a model version is known to be inactive: its status is known and other than active. Its
 * status is undefined until it is looked up, which counts as not known.
 *
 * @example isKnownInactive(DesiredStateVersionStatus.retired) // true
 */
export const isKnownInactive = (
  modelVersionStatus: DesiredStateVersionStatus | undefined
): boolean =>
  modelVersionStatus !== undefined && modelVersionStatus !== DesiredStateVersionStatus.active;

/**
 * Drops the pair of % wildcards the console wraps around a contains value. A value without that
 * pair, like a pattern posted through the API, stays as is.
 *
 * @example trimWildcards("%File%") // "File"
 * @example trimWildcards("File%") // "File%"
 */
const trimWildcards = (value: string): string =>
  value.length >= 2 && value.startsWith("%") && value.endsWith("%") ? value.slice(1, -1) : value;

/**
 * Turns a string match into values, one per matched value. An enum match fits too, since it is a
 * string match without the substring operators. The equality values go through formatValue, the
 * substring values lose their % wildcards instead.
 *
 * @example createFilterValues({ eq: ["a"], contains: ["%b%"] }) // [{ value: "a" }, { value: "b", operator: "contains" }]
 */
const createFilterValues = (
  match: StringMatch | undefined,
  formatValue: (value: string) => string = (value) => value
): FilterValue[] => {
  if (match === undefined) {
    return [];
  }

  const { eq = [], neq = [], contains = [], notContains = [] } = match;

  return [
    ...eq.map((value): FilterValue => ({ value: formatValue(value) })),
    ...neq.map((value): FilterValue => ({ value: formatValue(value), operator: "neq" })),
    ...contains.map((value): FilterValue => ({
      value: trimWildcards(value),
      operator: "contains",
    })),
    ...notContains.map((value): FilterValue => ({
      value: trimWildcards(value),
      operator: "notContains",
    })),
  ];
};

/**
 * The display name of a service instance: its identity, or its id when it has none or isn't
 * loaded.
 *
 * @example getInstanceName("7cd8...", { "7cd8...": { service_identity_attribute_value: "cpe-east-2", ... } }) // "cpe-east-2"
 */
export const getInstanceName = (instanceId: string, instances: InstancesById): string =>
  instances[instanceId]?.service_identity_attribute_value ?? instanceId;

/**
 * Formats a status enum value the way it reads in a sentence.
 *
 * @example formatStatusValue("NON_COMPLIANT") // "non compliant"
 */
const formatStatusValue = (value: string): string => value.toLowerCase().replace(/_/g, " ");

/**
 * Splits a dry run's resource filter into the rows of its applied filter, in display order, without
 * empty rows. The version and status values are created apart, since they group several fields.
 * Instances show by name once they are loaded.
 *
 * @example createFilterRows({ isOrphan: false, agent: { eq: ["internal"] } }, {}) // [{ key: "agent", values: [{ value: "internal" }] }]
 */
export const createFilterRows = (
  filter: ResourceActionFilter,
  instances: InstancesById
): FilterRow[] => {
  const ownedValue: FilterValue = {
    value: words("desiredState.complianceCheck.scope.value.owned"),
    kind: "includeOwned",
  };
  const rows: FilterRow[] = [
    {
      key: "serviceEntity",
      values: (filter.serviceEntity ?? []).map((value): FilterValue => ({
        value,
        kind: "serviceEntity",
      })),
    },
    {
      key: "serviceInstance",
      values: [
        ...(filter.serviceInstance ?? []).map((instanceId): FilterValue => ({
          value: getInstanceName(instanceId, instances),
          kind: "serviceInstance",
        })),
        ...(filter.lifecycleState ?? []).map((state): FilterValue => ({
          value: words("desiredState.complianceCheck.scope.value.lifecycleState")(state),
        })),
        ...(filter.includeOwned ? [ownedValue] : []),
      ],
    },
    { key: "agent", values: createFilterValues(filter.agent) },
    { key: "resourceType", values: createFilterValues(filter.resourceType) },
    { key: "resourceIdValue", values: createFilterValues(filter.resourceIdValue) },
    {
      key: "purged",
      values:
        filter.purged === undefined
          ? []
          : [{ value: words(`desiredState.complianceCheck.scope.value.purged.${filter.purged}`) }],
    },
  ];

  return rows.filter(({ values }) => values.length > 0);
};

/**
 * Creates the values of the version row: the version the dry run ran on, and how the filter
 * selected it. Latest intent (isOrphan: false) is a flag while the model version is active or its
 * status is unknown; once it is known to be other than active, it was only the latest intent when
 * the dry run ran, and shows as a plain value.
 *
 * @example createVersionValues({ isOrphan: false }, 214, DesiredStateVersionStatus.active) // [{ value: "v214" }, { value: "latest intent", kind: "latestIntent" }]
 */
export const createVersionValues = (
  filter: ResourceActionFilter,
  modelVersion: number,
  modelVersionStatus: DesiredStateVersionStatus | undefined
): FilterValue[] => {
  const modelVersionValue = { value: words("modelVersion")(modelVersion) };

  if (filter.instanceVersion !== undefined) {
    return [{ value: words("instanceVersion")(filter.instanceVersion) }, modelVersionValue];
  }
  if (filter.modelVersion !== undefined) {
    return [modelVersionValue];
  }
  if (filter.isOrphan === false) {
    return [
      modelVersionValue,
      isKnownInactive(modelVersionStatus)
        ? { value: words("desiredState.complianceCheck.scope.value.wasLatestIntent") }
        : {
            value: words("desiredState.complianceCheck.scope.value.latestIntent"),
            kind: "latestIntent",
          },
    ];
  }

  return [];
};

/**
 * Creates the values of the status row: the conditions on the resources' status, which describe a
 * moment rather than the scope.
 *
 * @example createStatusValues({ compliance: { neq: ["NON_COMPLIANT"] }, isDeploying: true }) // [{ value: "non compliant", operator: "neq" }, { value: "deploying" }]
 */
export const createStatusValues = (filter: ResourceActionFilter): FilterValue[] => [
  ...createFilterValues(filter.compliance, formatStatusValue),
  ...createFilterValues(filter.lastHandlerRun, formatStatusValue),
  ...createFilterValues(filter.blocked, formatStatusValue),
  ...(filter.isDeploying === undefined
    ? []
    : [
        {
          value: words(
            `desiredState.complianceCheck.scope.value.isDeploying.${filter.isDeploying}`
          ),
        },
      ]),
  ...(filter.isOrphan
    ? [{ value: words("desiredState.complianceCheck.scope.value.orphansOnly") }]
    : []),
];

/**
 * Whether a dry run's filter narrows the resources, rather than only picking the model version.
 *
 * @example isFiltered([], []) // false
 */
export const isFiltered = (rows: FilterRow[], statusValues: FilterValue[]): boolean =>
  rows.length > 0 || statusValues.length > 0;

/**
 * Formats a value with its operator. A value without one shows as is.
 *
 * @example formatFilterValue({ value: "File", operator: "contains" }) // 'contains "File"'
 */
export const formatFilterValue = ({ value, operator }: FilterValue): string =>
  operator ? words(`desiredState.complianceCheck.scope.operator.${operator}`)(value) : value;

/**
 * Summarizes a dry run's applied filter in a few words, to tell reports of the same model version
 * apart. It leads with the service anchor (entity › instance) and collapses the rest into "+owned"
 * and "+N"; without an anchor, a single condition is shown whole, and more read
 * "Filtered · N conditions". A dry run that only picks a version reads "Full model".
 *
 * @example formatScopeLabel([{ key: "agent", values: [{ value: "router-east" }] }], []) // "Agent = router-east"
 */
export const formatScopeLabel = (rows: FilterRow[], statusValues: FilterValue[]): string => {
  if (!isFiltered(rows, statusValues)) {
    return words("desiredState.complianceCheck.scope.fullModel");
  }

  const values = [...rows.flatMap(({ values }) => values), ...statusValues];
  const anchorKinds: FilterValue["kind"][] = ["serviceEntity", "serviceInstance"];
  const anchorValues = anchorKinds.flatMap(
    (anchorKind) => values.find(({ kind }) => kind === anchorKind) ?? []
  );
  const hasOwned = values.some(({ kind }) => kind === "includeOwned");

  if (anchorValues.length > 0) {
    const otherCount = values.length - anchorValues.length - (hasOwned ? 1 : 0);

    return [
      words("desiredState.complianceCheck.scope.label.anchor")(
        anchorValues.map(({ value }) => value)
      ),
      hasOwned ? words("desiredState.complianceCheck.scope.label.owned") : undefined,
      otherCount > 0
        ? words("desiredState.complianceCheck.scope.label.more")(otherCount)
        : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (values.length === 1) {
    const [{ value, operator = "eq" }] = values;
    const rowKey = rows.length > 0 ? rows[0].key : "status";

    return words("desiredState.complianceCheck.scope.label.condition")(
      words(`desiredState.complianceCheck.scope.row.${rowKey}`),
      words(`desiredState.complianceCheck.scope.operator.${operator}`)(value)
    );
  }

  return words("desiredState.complianceCheck.scope.label.conditions")(values.length);
};

/**
 * Counts the agents and the changed resources in a dry run's diff.
 *
 * @example countDiff([{ resource_id: "std::File[a,path=/x]", status: "modified", ... }]) // { agentCount: 1, changedCount: 1 }
 */
export const countDiff = (diff: Diff.Resource[]): DiffCounts => ({
  agentCount: new Set(
    diff.flatMap(({ resource_id }) => Resource.IdParser.getAgentName(resource_id) ?? [])
  ).size,
  changedCount: diff.filter(({ status }) => Diff.changedStatuses.includes(status)).length,
});

/**
 * Creates the plan to re-run a dry run with the same scope on the same model version. A filter that
 * already sets a model or instance version is posted as is. One that targets the active model
 * version (isOrphan: false) is posted as is while that version is still active, and otherwise gets
 * the report's model version, unless its filter blocks selecting a version.
 *
 * @example createRerunPlan({ isOrphan: false, agent: { eq: ["internal"] } }, 4, false) // { kind: "ready", filter: { agent: { eq: ["internal"] }, modelVersion: 4 } }
 */
export const createRerunPlan = (
  resourceFilter: ResourceActionFilter,
  modelVersion: number,
  isActiveVersion: boolean
): RerunPlan => {
  const setsVersion =
    resourceFilter.modelVersion !== undefined || resourceFilter.instanceVersion !== undefined;

  if (setsVersion || isActiveVersion) {
    return { kind: "ready", filter: resourceFilter };
  }

  const blocker = getVersionSelectionBlocker(resourceFilter);

  if (blocker) {
    return { kind: "blocked", blockedBy: blocker };
  }

  return {
    kind: "ready",
    filter: withDryRunVersion(resourceFilter, { type: "modelVersion", version: modelVersion }),
  };
};
