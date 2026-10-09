/**
 * A version to pin a dry-run filter to: a model version, or the version of the one service
 * instance the filter selects, which the server maps to a model version.
 */
export interface VersionPin {
  field: "modelVersion" | "instanceVersion";
  version: number;
}

/**
 * Why a dry run can only use the active version: its filter includes owned services ("owned"), or
 * uses a Status tab filter ("status"). Any other filter, like agent or resource type, can use any
 * version.
 */
export type VersionLock = "owned" | "status";
