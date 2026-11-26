import { ResourceActionFilter } from "@inmanta/web-console-core";
import {
  getVersionSelectionBlocker,
  withDryRunVersion,
} from "@inmanta/web-console-core/Queries/Slices/Resource";
import { ReportScopeDryRunPlan } from "./types";

/**
 * Creates the plan to start a new dry run on a report's scope: its filter on its model version. A
 * filter that already sets a model or instance version is posted as is. One that targets the active
 * model version (isOrphan: false) is posted as is while that version is still active, and otherwise
 * gets the report's model version, unless its filter blocks selecting a version.
 *
 * @example createReportScopeDryRunPlan({ isOrphan: false, agent: { eq: ["internal"] } }, 4, false) // { kind: "ready", filter: { agent: { eq: ["internal"] }, modelVersion: 4 } }
 */
export const createReportScopeDryRunPlan = (
  resourceFilter: ResourceActionFilter,
  modelVersion: number,
  isActiveVersion: boolean
): ReportScopeDryRunPlan => {
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
