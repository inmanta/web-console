import { ServiceInstanceModel } from "@/Core";
import {
  ResourceActionFilter,
  StringMatch,
  VersionSelectionBlocker,
  getVersionSelectionBlocker,
  withDryRunVersion,
} from "@/Data/Queries";
import { words } from "@/UI/words";
import { DesiredStateVersion, DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";

/**
 * The rows of a dry run's applied filter, by what they describe. Most rows are the filter field of
 * the same name; the instance row also holds the instances' lifecycle state and owned services,
 * and version and status each group several fields. The status row holds the conditions on a
 * resource's current state, which describe a moment rather than the scope, so it is shown last and
 * apart.
 */
export type ScopeRowKey =
  | Extract<
      keyof ResourceActionFilter,
      "serviceEntity" | "serviceInstance" | "agent" | "resourceType" | "resourceIdValue" | "purged"
    >
  | "version"
  | "status";

/**
 * The operators a filter value can carry besides equality: those of a string match.
 */
export type ScopeOperator = Exclude<keyof StringMatch, "eq">;

/**
 * One value in a row of the applied filter, with the filter field it comes from when it is shown
 * differently. A service entity and a service instance make up the scope label's anchor. Owned
 * services (includeOwned) and latest intent (isOrphan: false) are flags: they are always shown and
 * get their own color.
 */
export interface ScopeValue {
  value: string;
  operator?: ScopeOperator;
  kind?:
    | Extract<keyof ResourceActionFilter, "serviceEntity" | "serviceInstance" | "includeOwned">
    | "latestIntent";
}

/**
 * One row of the applied filter: its values, and an optional note after them.
 */
export interface ScopeRow {
  key: ScopeRowKey;
  values: ScopeValue[];
  note?: string;
}

/**
 * Whether a value is a flag (owned services, latest intent) rather than a condition value.
 *
 * @example isFlag({ value: "owned", kind: "includeOwned" }) // true
 */
export const isFlag = ({ kind }: ScopeValue): boolean =>
  kind === "includeOwned" || kind === "latestIntent";

/**
 * Drops the % wildcards the console wraps around a contains value.
 *
 * @example trimWildcards("%File%") // "File"
 */
const trimWildcards = (value: string): string => value.replace(/^%|%$/g, "");

/**
 * Turns a string or enum match into values, one per matched value. An enum match is a string match
 * without the substring operators.
 *
 * @example matchToValues({ eq: ["a"], contains: ["%b%"] }) // [{ value: "a" }, { value: "b", operator: "contains" }]
 */
const matchToValues = (
  match: StringMatch | undefined,
  format: (value: string) => string = (value) => value
): ScopeValue[] => {
  if (match === undefined) {
    return [];
  }

  const { eq = [], neq = [], contains = [], notContains = [] } = match;

  return [
    ...eq.map((value): ScopeValue => ({ value: format(value) })),
    ...neq.map((value): ScopeValue => ({ value: format(value), operator: "neq" })),
    ...contains.map((value): ScopeValue => ({ value: trimWildcards(value), operator: "contains" })),
    ...notContains.map((value): ScopeValue => ({
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
): ScopeRow | undefined => {
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
 * @example getScopeRows({ isOrphan: false, agent: { eq: ["internal"] } }, 5, {}) // [{ key: "agent", values: [{ value: "internal" }] }, { key: "version", ... }]
 */
export const getScopeRows = (
  filter: ResourceActionFilter,
  modelVersion: number,
  instances: Record<string, ServiceInstanceModel>
): ScopeRow[] => {
  const ownedValue: ScopeValue = {
    value: words("desiredState.complianceCheck.scope.value.owned"),
    kind: "includeOwned",
  };
  const rows: (ScopeRow | undefined)[] = [
    {
      key: "serviceEntity",
      values: (filter.serviceEntity ?? []).map((value): ScopeValue => ({
        value,
        kind: "serviceEntity",
      })),
    },
    {
      key: "serviceInstance",
      values: [
        ...(filter.serviceInstance ?? []).map((instanceId): ScopeValue => ({
          value: getInstanceName(instanceId, instances),
          kind: "serviceInstance",
        })),
        ...(filter.lifecycleState ?? []).map((state): ScopeValue => ({
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

  return rows.filter((row): row is ScopeRow => row !== undefined && row.values.length > 0);
};

/**
 * Whether a dry run's filter narrows the resources, rather than only picking the model version.
 *
 * @example isFiltered(getScopeRows({ isOrphan: false }, 5, {})) // false
 */
export const isFiltered = (rows: ScopeRow[]): boolean => rows.some(({ key }) => key !== "version");

/**
 * The text of a value, with its operator.
 *
 * @example getValueText({ value: "File", operator: "contains" }) // 'contains "File"'
 */
export const getValueText = ({ value, operator }: ScopeValue): string =>
  operator ? words(`desiredState.complianceCheck.scope.operator.${operator}`)(value) : value;

/**
 * Summarizes a dry run's applied filter in a few words, to tell reports of the same model version
 * apart. It leads with the service anchor (entity › instance) and collapses the rest into "+owned"
 * and "+N"; without an anchor, a single condition is shown whole, and more read
 * "Filtered · N conditions". A dry run that only picks a version reads "Full model".
 *
 * @example getScopeLabel([{ key: "agent", values: [{ value: "router-east" }] }, versionRow]) // "agent = router-east"
 */
export const getScopeLabel = (rows: ScopeRow[]): string => {
  if (!isFiltered(rows)) {
    return words("desiredState.complianceCheck.scope.fullModel");
  }

  const conditionRows = rows.filter(({ key }) => key !== "version");
  const values = conditionRows.flatMap(({ values }) => values);
  const anchorKinds: ScopeValue["kind"][] = ["serviceEntity", "serviceInstance"];
  const anchorValues = anchorKinds.flatMap(
    (anchorKind) => values.find(({ kind }) => kind === anchorKind) ?? []
  );
  const hasOwned = values.some(({ kind }) => kind === "includeOwned");

  if (anchorValues.length > 0) {
    const otherCount = values.length - anchorValues.length - (hasOwned ? 1 : 0);

    return [
      anchorValues.map(({ value }) => value).join(" › "),
      hasOwned ? words("desiredState.complianceCheck.scope.label.owned") : undefined,
      otherCount > 0 ? `+${otherCount}` : undefined,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (values.length === 1) {
    const [row] = conditionRows;
    const [value] = values;
    const rowLabel = words(`desiredState.complianceCheck.scope.row.${row.key}`).toLowerCase();

    return value.operator ? `${rowLabel} ${getValueText(value)}` : `${rowLabel} = ${value.value}`;
  }

  return words("desiredState.complianceCheck.scope.label.conditions")(values.length);
};

/**
 * What is known about a report's model version: still being looked up ("loading"), the lookup
 * failed ("failed"), the version no longer exists ("missing"), or its lifecycle status.
 */
export type ModelVersionLookup = "loading" | "failed" | "missing" | DesiredStateVersionStatus;

/**
 * Turns the lookup of a report's model version into what the report needs to know about it. The
 * lookup holds null when the version no longer exists.
 *
 * @example getModelVersionLookup({ data: null, isError: false }) // "missing"
 */
export const getModelVersionLookup = ({
  data,
  isError,
}: {
  data: DesiredStateVersion | null | undefined;
  isError: boolean;
}): ModelVersionLookup => {
  if (isError) {
    return "failed";
  }
  if (data === undefined) {
    return "loading";
  }
  if (data === null) {
    return "missing";
  }

  return data.status;
};

/**
 * The lifecycle status of a report's model version, or undefined while it isn't known: still
 * being looked up, the lookup failed, or the version no longer exists.
 *
 * @example getKnownStatus("missing") // undefined
 */
export const getKnownStatus = (
  lookup: ModelVersionLookup
): DesiredStateVersionStatus | undefined => {
  if (lookup === "loading" || lookup === "failed" || lookup === "missing") {
    return undefined;
  }

  return lookup;
};

/**
 * Whether a report's model version is known not to be the active one, also when it no longer
 * exists. False while it is looked up or when that failed, since then it isn't known.
 *
 * @example isNotActiveVersion(DesiredStateVersionStatus.retired) // true
 */
export const isNotActiveVersion = (lookup: ModelVersionLookup): boolean => {
  const status = getKnownStatus(lookup);

  return (
    lookup === "missing" || (status !== undefined && status !== DesiredStateVersionStatus.active)
  );
};

/**
 * The filter that re-runs a dry run report, or what blocks re-running it.
 */
export type RerunFilter = { filter: ResourceActionFilter } | { blockedBy: VersionSelectionBlocker };

/**
 * Returns the filter that re-runs a dry run with the same scope on the same model version. A filter
 * that already sets a model or instance version is posted as is. One that targets the active model
 * version (isOrphan: false) is posted as is while that version is still active, and otherwise gets
 * the report's model version, unless its filter blocks selecting a version.
 *
 * @example getRerunFilter({ isOrphan: false, agent: { eq: ["internal"] } }, 4, false) // { filter: { agent: { eq: ["internal"] }, modelVersion: 4 } }
 */
export const getRerunFilter = (
  resourceFilter: ResourceActionFilter,
  modelVersion: number,
  isActiveVersion: boolean
): RerunFilter => {
  const setsVersion =
    resourceFilter.modelVersion !== undefined || resourceFilter.instanceVersion !== undefined;

  if (setsVersion || isActiveVersion) {
    return { filter: resourceFilter };
  }

  const blocker = getVersionSelectionBlocker(resourceFilter);

  if (blocker) {
    return { blockedBy: blocker };
  }

  return {
    filter: withDryRunVersion(resourceFilter, { type: "modelVersion", version: modelVersion }),
  };
};
