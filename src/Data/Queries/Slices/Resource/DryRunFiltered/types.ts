/**
 * A version to pin a dry-run filter to: a model version, or the version of the one service
 * instance the filter selects, which the server maps to a model version.
 */
export interface VersionPin {
  field: "modelVersion" | "instanceVersion";
  version: number;
}

/**
 * Why a dry-run filter can't be pinned to another version: it reaches owned services, or it
 * filters on the current resource status.
 */
export type VersionLock = "owned" | "status";
