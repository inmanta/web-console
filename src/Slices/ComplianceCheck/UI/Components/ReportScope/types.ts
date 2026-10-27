import { ResourceActionFilter, StringMatch } from "@inmanta/web-console-core";
import { VersionSelectionBlocker } from "@inmanta/web-console-core/Queries/Slices/Resource";

/**
 * The filter fields that get a row of their own in the applied filter, under the same name. The
 * instance row also holds the instances' lifecycle state and owned services.
 */
export type FilterRowKey = Extract<
  keyof ResourceActionFilter,
  "serviceEntity" | "serviceInstance" | "agent" | "resourceType" | "resourceIdValue" | "purged"
>;

/**
 * The operators a filter value can carry besides equality: those of a string match.
 */
export type FilterOperator = Exclude<keyof StringMatch, "eq">;

/**
 * One value in the applied filter, with the filter field it comes from when it is shown
 * differently. A service entity and a service instance make up the scope label's anchor. Owned
 * services (includeOwned) and latest intent (isOrphan: false) are flags: they are always shown and
 * get their own color.
 */
export interface FilterValue {
  value: string;
  operator?: FilterOperator;
  kind?:
    | Extract<keyof ResourceActionFilter, "serviceEntity" | "serviceInstance" | "includeOwned">
    | "latestIntent";
}

/**
 * One row of the applied filter: a filter field and its values.
 */
export interface FilterRow {
  key: FilterRowKey;
  values: FilterValue[];
}

/**
 * A dry run report's scope as the page shows it: the rows of its applied filter, the values of its
 * status row, whether its filter narrows the resources rather than only picking the model version,
 * and the scope label that sums it up.
 */
export interface ReportScopeParts {
  rows: FilterRow[];
  statusValues: FilterValue[];
  isFiltered: boolean;
  label: string;
}

/**
 * How to re-run a dry run report: with this filter, or not at all because the filter can't target
 * the report's model version.
 */
export type RerunPlan =
  | { kind: "ready"; filter: ResourceActionFilter }
  | { kind: "blocked"; blockedBy: VersionSelectionBlocker };

/**
 * The agents and the changed resources in a dry run's diff.
 */
export interface DiffCounts {
  agentCount: number;
  changedCount: number;
}
