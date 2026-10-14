import { Diff, Resource, ResourceActionFilter, ServiceInstanceModel, StringMatch } from "@/Core";
import { getVersionSelectionBlocker, withDryRunVersion } from "@/Data/Queries/Slices/Resource";
import { words } from "@/UI/words";
import { DesiredStateVersion } from "@S/DesiredState/Core/Domain";
import { DiffCounts, FilterRow, FilterValue, ModelVersionState, RerunPlan } from "./types";

/**
 * Whether a value is a flag (owned services, latest intent) rather than a condition value.
 *
 * @example isFlag({ value: "owned", kind: "includeOwned" }) // true
 */
export const isFlag = ({ kind }: FilterValue): boolean =>
  kind === "includeOwned" || kind === "latestIntent";

/**
 * Drops the % wildcards the console wraps around a contains value.
 *
 * @example trimWildcards("%File%") // "File"
 */
const trimWildcards = (value: string): string => value.replace(/^%|%$/g, "");

/**
 * Turns a string match into values, one per matched value. An enum match fits too, since it is a
 * string match without the substring operators. The equality values go through format, the
 * substring values lose their % wildcards instead.
 *
 * @example matchToValues({ eq: ["a"], contains: ["%b%"] }) // [{ value: "a" }, { value: "b", operator: "contains" }]
 */
const matchToValues = (
  match: StringMatch | undefined,
  format: (value: string) => string = (value) => value
): FilterValue[] => {
  if (match === undefined) {
    return [];
  }

  const { eq = [], neq = [], contains = [], notContains = [] } = match;

  return [
    ...eq.map((value): FilterValue => ({ value: format(value) })),
    ...neq.map((value): FilterValue => ({ value: format(value), operator: "neq" })),
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
export const getInstanceName = (
  instanceId: string,
  instances: Record<string, ServiceInstanceModel>
): string => instances[instanceId]?.service_identity_attribute_value ?? instanceId;

/**
 * Formats a status enum value the way it reads in a sentence.
 *
 * @example formatStatusValue("NON_COMPLIANT") // "non compliant"
 */
const formatStatusValue = (value: string): string => value.toLowerCase().replace(/_/g, " ");

/**
 * Builds the version row: the version the dry run ran on, and how the filter selected it.
 *
 * @example getVersionRow({ isOrphan: false }, 214) // { key: "version", values: [{ value: "v214" }, { value: "latest intent", kind: "latestIntent" }], note: "excludes orphans" }
 */
const getVersionRow = (
  filter: ResourceActionFilter,
  modelVersion: number
): FilterRow | undefined => {
  const modelVersionValue = { value: words("modelVersion")(modelVersion) };

  if (filter.instanceVersion !== undefined) {
    return {
      key: "version",
      values: [{ value: words("instanceVersion")(filter.instanceVersion) }, modelVersionValue],
    };
  }
  if (filter.modelVersion !== undefined) {
    return { key: "version", values: [modelVersionValue] };
  }
  if (filter.isOrphan === false) {
    return {
      key: "version",
      values: [
        modelVersionValue,
        {
          value: words("desiredState.complianceCheck.scope.value.latestIntent"),
          kind: "latestIntent",
        },
      ],
      note: words("desiredState.complianceCheck.scope.value.excludesOrphans"),
    };
  }

  return undefined;
};

/**
 * Splits a dry run's resource filter into the rows of its applied filter, in display order, without
 * empty rows. The rows hold only what the filter holds; instances show by name once they are
 * loaded.
 *
 * @example getFilterRows({ isOrphan: false, agent: { eq: ["internal"] } }, 5, {}) // [{ key: "agent", values: [{ value: "internal" }] }, { key: "version", ... }]
 */
export const getFilterRows = (
  filter: ResourceActionFilter,
  modelVersion: number,
  instances: Record<string, ServiceInstanceModel>
): FilterRow[] => {
  const ownedValue: FilterValue = {
    value: words("desiredState.complianceCheck.scope.value.owned"),
    kind: "includeOwned",
  };
  const rows: (FilterRow | undefined)[] = [
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
    { key: "agent", values: matchToValues(filter.agent) },
    { key: "resourceType", values: matchToValues(filter.resourceType) },
    { key: "resourceIdValue", values: matchToValues(filter.resourceIdValue) },
    {
      key: "purged",
      values:
        filter.purged === undefined
          ? []
          : [{ value: words(`desiredState.complianceCheck.scope.value.purged.${filter.purged}`) }],
    },
    getVersionRow(filter, modelVersion),
    {
      key: "status",
      termNote: words("desiredState.complianceCheck.scope.row.status.note"),
      isApart: true,
      values: [
        ...matchToValues(filter.compliance, formatStatusValue),
        ...matchToValues(filter.lastHandlerRun, formatStatusValue),
        ...matchToValues(filter.blocked, formatStatusValue),
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
      ],
    },
  ];

  return rows.filter((row): row is FilterRow => row !== undefined && row.values.length > 0);
};

/**
 * Whether a dry run's filter narrows the resources, rather than only picking the model version.
 *
 * @example isFiltered(getFilterRows({ isOrphan: false }, 5, {})) // false
 */
export const isFiltered = (rows: FilterRow[]): boolean => rows.some(({ key }) => key !== "version");

/**
 * The text of a value, with its operator. A value without one shows as is.
 *
 * @example getValueText({ value: "File", operator: "contains" }) // 'contains "File"'
 */
export const getValueText = ({ value, operator }: FilterValue): string =>
  operator ? words(`desiredState.complianceCheck.scope.operator.${operator}`)(value) : value;

/**
 * Summarizes a dry run's applied filter in a few words, to tell reports of the same model version
 * apart. It leads with the service anchor (entity › instance) and collapses the rest into "+owned"
 * and "+N"; without an anchor, a single condition is shown whole, and more read
 * "Filtered · N conditions". A dry run that only picks a version reads "Full model".
 *
 * @example getScopeLabel([{ key: "agent", values: [{ value: "router-east" }] }, versionRow]) // "Agent = router-east"
 */
export const getScopeLabel = (rows: FilterRow[]): string => {
  if (!isFiltered(rows)) {
    return words("desiredState.complianceCheck.scope.fullModel");
  }

  const conditionRows = rows.filter(({ key }) => key !== "version");
  const values = conditionRows.flatMap(({ values }) => values);
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
    const [row] = conditionRows;
    const [{ value, operator = "eq" }] = values;

    return words("desiredState.complianceCheck.scope.label.condition")(
      words(`desiredState.complianceCheck.scope.row.${row.key}`),
      words(`desiredState.complianceCheck.scope.operator.${operator}`)(value)
    );
  }

  return words("desiredState.complianceCheck.scope.label.conditions")(values.length);
};

/**
 * Turns the lookup of a report's model version into what is known about it. The lookup holds null
 * when the version no longer exists. Data from an earlier lookup still counts when a later one
 * fails.
 *
 * @example getModelVersionState({ data: null, isError: false }) // { state: "missing" }
 */
export const getModelVersionState = ({
  data,
  isError,
}: {
  data: DesiredStateVersion | null | undefined;
  isError: boolean;
}): ModelVersionState => {
  if (data === null) {
    return { state: "missing" };
  }
  if (data !== undefined) {
    return { state: "known", status: data.status };
  }

  return { state: isError ? "failed" : "loading" };
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
 * Returns how to re-run a dry run with the same scope on the same model version. A filter that
 * already sets a model or instance version is posted as is. One that targets the active model
 * version (isOrphan: false) is posted as is while that version is still active, and otherwise gets
 * the report's model version, unless its filter blocks selecting a version.
 *
 * @example getRerunPlan({ isOrphan: false, agent: { eq: ["internal"] } }, 4, false) // { kind: "ready", filter: { agent: { eq: ["internal"] }, modelVersion: 4 } }
 */
export const getRerunPlan = (
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
