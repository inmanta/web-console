import { DryRunContext, ResourceActionFilter } from "@inmanta/web-console-core";
import { DryRunVersion, VersionSelectionBlocker } from "./types";

/**
 * Creates the context the web-console stores with a filtered dry run: the known label of each
 * service instance the filter names, so its report shows them. An instance without a known label
 * is left out.
 *
 * @example createDryRunContext({ serviceInstance: ["abc"] }, { abc: "cpe-1" }) // { web_instance_labels: { abc: "cpe-1" } }
 */
export const createDryRunContext = (
  filter: ResourceActionFilter,
  instanceLabels: Record<string, string>
): DryRunContext => {
  const contextInstanceLabels: Record<string, string> = {};

  for (const instanceId of filter.serviceInstance ?? []) {
    const instanceLabel = instanceLabels[instanceId];

    if (instanceLabel !== undefined) {
      contextInstanceLabels[instanceId] = instanceLabel;
    }
  }

  return { web_instance_labels: contextInstanceLabels };
};

/**
 * Checks whether a filter uses a Status tab filter, which narrows on a resource's current state.
 * The server won't combine those fields with a selected version.
 *
 * @example hasStatusFilter({ isOrphan: false, compliance: { eq: ["NON_COMPLIANT"] } }) // true
 */
const hasStatusFilter = (filter: ResourceActionFilter): boolean =>
  filter.isOrphan === true ||
  filter.isDeploying !== undefined ||
  filter.blocked !== undefined ||
  filter.compliance !== undefined ||
  filter.lastHandlerRun !== undefined;

/**
 * Returns the part of this filter that blocks selecting a version for a dry run, or undefined when
 * any version can be selected. The server can't combine a selected version with owned services, or
 * with the Status tab filters, since those match a resource's current state rather than a version.
 *
 * @example getVersionSelectionBlocker({ isOrphan: false, serviceInstance: ["abc"], includeOwned: true }) // "ownedServices"
 */
export const getVersionSelectionBlocker = (
  filter: ResourceActionFilter
): VersionSelectionBlocker | undefined => {
  if (filter.includeOwned) {
    return "ownedServices";
  }
  if (hasStatusFilter(filter)) {
    return "statusFilter";
  }

  return undefined;
};

/**
 * Sets the version a dry run on this filter runs against. It replaces isOrphan, which otherwise
 * targets the active model version, since the server accepts only one version per filter.
 *
 * @example withDryRunVersion({ isOrphan: false, agent: { eq: ["internal"] } }, { type: "modelVersion", version: 9 }) // { agent: { eq: ["internal"] }, modelVersion: 9 }
 */
export const withDryRunVersion = (
  filter: ResourceActionFilter,
  dryRunVersion: DryRunVersion
): ResourceActionFilter => {
  const { isOrphan: _isOrphan, ...rest } = filter;

  return { ...rest, [dryRunVersion.type]: dryRunVersion.version };
};

/**
 * Targets the active model version, the latest released one, when a filter sets no version.
 * Without it, every resource resolves at the newest model version it appears in, so orphans pull in
 * older model versions and the server rejects the dry run for spanning several.
 *
 * @example withActiveModelVersion({ agent: { eq: ["internal"] } }) // { agent: { eq: ["internal"] }, isOrphan: false }
 */
export const withActiveModelVersion = (filter: ResourceActionFilter): ResourceActionFilter =>
  filter.isOrphan === undefined ? { ...filter, isOrphan: false } : filter;
