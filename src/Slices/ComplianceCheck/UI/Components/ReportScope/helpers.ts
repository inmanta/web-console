import { Diff, DryRun, Resource, ResourceActionFilter, StringMatch, isObject, words } from "@/Core";
import { getVersionSelectionBlocker, withDryRunVersion } from "@/Data/Queries/Slices/Resource";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";
import { DiffCounts, FilterRow, FilterValue, ReportScopeParts, RerunPlan } from "./types";

/**
 * Gets the labels of the service instances a dry run report's filter names, keyed by instance id,
 * as the web-console stored them in its context. Any client can store anything in the context, so
 * it keeps only the labels that are strings. A report started without them has none.
 *
 * @example getReportInstanceLabels({ context: { web_instance_labels: { abc: "cpe-1", def: 7 } }, ... }) // { abc: "cpe-1" }
 */
export const getReportInstanceLabels = (report: DryRun): Record<string, string> => {
  const contextInstanceLabels = report.context?.web_instance_labels;
  const instanceLabels: Record<string, string> = {};

  if (!isObject(contextInstanceLabels)) {
    return instanceLabels;
  }

  for (const [instanceId, label] of Object.entries(contextInstanceLabels)) {
    if (typeof label === "string") {
      instanceLabels[instanceId] = label;
    }
  }

  return instanceLabels;
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
 */
const trimWildcards = (value: string): string =>
  value.length >= 2 && value.startsWith("%") && value.endsWith("%") ? value.slice(1, -1) : value;

/**
 * Turns a string match into values, one per matched value. An enum match fits too, since it is a
 * string match without the substring operators. The equality values go through formatValue, the
 * substring values lose their % wildcards instead.
 *
 * @example createFilterValues({ contains: ["%File%"] }) // [{ value: "File", operator: "contains" }]
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
 * The label of a service instance: its stored label, or its id when it has none.
 *
 * @example getInstanceLabel("abc", { abc: "cpe-1" }) // "cpe-1"
 */
export const getInstanceLabel = (
  instanceId: string,
  instanceLabels: Record<string, string>
): string => instanceLabels[instanceId] ?? instanceId;

/**
 * Formats a status enum value the way it reads in a sentence.
 *
 * @example formatStatusValue("NON_COMPLIANT") // "non compliant"
 */
const formatStatusValue = (value: string): string => value.toLowerCase().replace(/_/g, " ");

/**
 * Splits a dry run's resource filter into the rows of its applied filter, in display order, without
 * empty rows. The version and status values are created apart, since they group several fields.
 * Instances show by their label in instanceLabels, or by id.
 *
 * @example createFilterRows({ isOrphan: false, agent: { eq: ["internal"] } }, {}) // [{ key: "agent", values: [{ value: "internal" }] }]
 */
export const createFilterRows = (
  filter: ResourceActionFilter,
  instanceLabels: Record<string, string>
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
          value: getInstanceLabel(instanceId, instanceLabels),
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
 * @example createVersionValues({ isOrphan: false }, 5, DesiredStateVersionStatus.active) // [{ value: "v5" }, { value: "latest intent", kind: "latestIntent" }]
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
 * @example createStatusValues({ compliance: { eq: ["NON_COMPLIANT"] } }) // [{ value: "non compliant" }]
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
 * Formats a value with its operator. A value without one shows as is.
 *
 * @example formatFilterValue({ value: "File", operator: "contains" }) // 'contains "File"'
 */
export const formatFilterValue = ({ value, operator }: FilterValue): string =>
  operator ? words(`desiredState.complianceCheck.scope.operator.${operator}`)(value) : value;

/**
 * Summarizes the applied filter of a dry run that narrows the resources in a few words, to tell
 * reports of the same model version apart. It leads with the service anchor (entity › instance)
 * and collapses the rest into "+owned" and "+N"; without an anchor, a single condition is shown
 * whole, and more read "Filtered · N conditions".
 *
 * @example formatScopeLabel([{ key: "agent", values: [{ value: "internal" }] }], []) // "Agent = internal"
 */
export const formatScopeLabel = (rows: FilterRow[], statusValues: FilterValue[]): string => {
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
 * Creates a dry run report's scope from its resource filter, with its service instances shown by
 * the labels stored with the report. A dry run on the whole model version, or one whose filter only
 * picks the version, has no rows or status values and reads "Full model".
 *
 * @example createReportScopeParts({ resource_filter: { isOrphan: false, agent: { eq: ["internal"] } }, ... }) // { rows: [{ key: "agent", values: [{ value: "internal" }] }], statusValues: [], isFiltered: true, label: "Agent = internal" }
 */
export const createReportScopeParts = (report: DryRun): ReportScopeParts => {
  const resourceFilter = report.resource_filter ?? {};
  const rows = createFilterRows(resourceFilter, getReportInstanceLabels(report));
  const statusValues = createStatusValues(resourceFilter);
  const isFiltered = rows.length > 0 || statusValues.length > 0;

  return {
    rows,
    statusValues,
    isFiltered,
    label: isFiltered
      ? formatScopeLabel(rows, statusValues)
      : words("desiredState.complianceCheck.scope.fullModel"),
  };
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
