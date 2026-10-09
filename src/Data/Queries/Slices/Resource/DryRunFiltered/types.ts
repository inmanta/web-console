/**
 * The kinds of version a dry run can run against, named after their filter field: a model version,
 * or a version of the one service instance the filter targets, which the server maps to a model
 * version.
 */
export type DryRunVersionType = "modelVersion" | "instanceVersion";

/**
 * The version a dry run runs against: its type and its number.
 */
export interface DryRunVersion {
  type: DryRunVersionType;
  version: number;
}

/**
 * The part of a filter that blocks selecting a version for a dry run, which then runs against the
 * active model version: owned services ("ownedServices"), or a Status tab filter ("statusFilter").
 * Any other filter, like agent or resource type, can run against any version.
 */
export type VersionSelectionBlocker = "ownedServices" | "statusFilter";
