import { ResourceActionFilter, ServiceInstanceModel, StringMatch } from "@/Core";
import { VersionSelectionBlocker } from "@/Data/Queries/Slices/Resource";

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
 * How to re-run a dry run report: with this filter, or not at all because the filter can't target
 * the report's model version.
 */
export type RerunPlan =
  | { kind: "ready"; filter: ResourceActionFilter }
  | { kind: "blocked"; blockedBy: VersionSelectionBlocker };

/**
 * The service instances the reports' filters name, looked up so far, keyed by their id.
 */
export type InstancesById = Record<string, ServiceInstanceModel>;

/**
 * The agents and the changed resources in a dry run's diff.
 */
export interface DiffCounts {
  agentCount: number;
  changedCount: number;
}
