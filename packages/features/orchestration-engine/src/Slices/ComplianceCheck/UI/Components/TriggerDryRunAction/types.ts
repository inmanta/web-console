import { ResourceActionFilter } from "@inmanta/web-console-core";
import { VersionSelectionBlocker } from "@inmanta/web-console-core/Queries/Slices/Resource";

/**
 * How to start a dry run on a report's scope: with this filter, or not at all because the filter
 * can't target the report's model version.
 */
export type ReportScopeDryRunPlan =
  | { kind: "ready"; filter: ResourceActionFilter }
  | { kind: "blocked"; blockedBy: VersionSelectionBlocker };
