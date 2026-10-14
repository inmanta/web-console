import { ResourceActionFilter, StringMatch } from "@/Core";
import { VersionSelectionBlocker } from "@/Data/Queries/Slices/Resource";
import { DesiredStateVersionStatus } from "@S/DesiredState/Core/Domain";

/**
 * The filter fields that get a row of their own in the applied filter, under the same name.
 */
export type FilterFieldRowKey = Extract<
  keyof ResourceActionFilter,
  "serviceEntity" | "serviceInstance" | "agent" | "resourceType" | "resourceIdValue" | "purged"
>;

/**
 * The rows of a dry run's applied filter, by what they describe: a filter field of the same name,
 * or the version and status rows, which each group several fields. The instance row also holds
 * the instances' lifecycle state and owned services.
 */
export type FilterRowKey = FilterFieldRowKey | "version" | "status";

/**
 * The operators a filter value can carry besides equality: those of a string match.
 */
export type FilterOperator = Exclude<keyof StringMatch, "eq">;

/**
 * One value in a row of the applied filter, with the filter field it comes from when it is shown
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
 * One row of the applied filter: its values, an optional note after them and an optional note
 * under its name. A row that is set apart (the status row, whose conditions describe a moment
 * rather than the scope) is shown last, below a divider.
 */
export interface FilterRow {
  key: FilterRowKey;
  values: FilterValue[];
  note?: string;
  termNote?: string;
  isApart?: boolean;
}

/**
 * What is known about a report's model version: it is still being looked up, the lookup failed,
 * the version no longer exists, or its lifecycle status is known.
 */
export type ModelVersionState =
  | { state: "loading" | "failed" | "missing" }
  | { state: "known"; status: DesiredStateVersionStatus };

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
