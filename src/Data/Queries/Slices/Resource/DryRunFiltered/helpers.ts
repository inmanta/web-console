import { ResourceActionFilter } from "../ResourceActionFilter";
import { VersionLock, VersionPin } from "./types";

/**
 * Checks whether a filter narrows on the current resource state. The server won't combine those
 * fields with a pinned model version.
 *
 * @example hasCurrentStateFilter({ isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } }) // true
 */
const hasCurrentStateFilter = (filter: ResourceActionFilter): boolean =>
  filter.isOrphan === true ||
  filter.isDeploying !== undefined ||
  filter.blocked !== undefined ||
  filter.compliance !== undefined ||
  filter.lastHandlerRun !== undefined;

/**
 * Returns why a dry run on this filter can only use the active version, or undefined when any
 * version can be picked. The server can't combine a picked version with owned services, or with
 * the Status tab filters, since those match a resource's current state rather than a version.
 *
 * @example getVersionLock({ isOrphan: false, serviceInstance: ["abc"], includeOwned: true }) // "owned"
 */
export const getVersionLock = (filter: ResourceActionFilter): VersionLock | undefined => {
  if (filter.includeOwned) {
    return "owned";
  }
  if (hasCurrentStateFilter(filter)) {
    return "status";
  }

  return undefined;
};

/**
 * Pins a filter to one version. The pin replaces isOrphan, which otherwise selects the latest
 * released version, since the server accepts only one version selector per filter.
 *
 * @example pinVersion({ isOrphan: false, agent: { eq: ["internal"] } }, { field: "modelVersion", version: 9 }) // { agent: { eq: ["internal"] }, modelVersion: 9 }
 */
export const pinVersion = (filter: ResourceActionFilter, pin: VersionPin): ResourceActionFilter => {
  const { isOrphan: _isOrphan, ...rest } = filter;

  return { ...rest, [pin.field]: pin.version };
};

/**
 * Selects the latest released version when a filter selects none. Without it, every resource
 * resolves at its own latest version, so orphans pull in older versions and the server rejects
 * the dry run for spanning several.
 *
 * @example withLatestVersion({ agent: { eq: ["internal"] } }) // { agent: { eq: ["internal"] }, isOrphan: false }
 */
export const withLatestVersion = (filter: ResourceActionFilter): ResourceActionFilter =>
  filter.isOrphan === undefined ? { ...filter, isOrphan: false } : filter;
