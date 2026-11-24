import { ParsedNumber } from "@inmanta/web-console-core";
// Loads the words of the shared components into WordsRegistry: this package uses them, and with
// project references a package only sees the declaration merging of the files it imports.
import type {} from "@inmanta/web-console-ui/messages";

/**
 * The English messages of the orchestration engine feature.
 */
export const orchestrationEngineMessages = {
  /**
   * Generic labels reused across views (column headers, tabs, field labels)
   */
  currentState: "Current state",
  attribute: "Attribute",

  /**
   * Inventory related text
   */
  "inventory.deleteVersion.title": "Delete version",
  "inventory.deleteVersion.header": (version: ParsedNumber) =>
    `Are you sure you want to delete version ${version}?`,

  /** Compile report related text */
  "compileReports.title": "Compile Reports",
  "compileReports.empty.message": "No compile reports found",
  "compileReports.columns.requested": "Requested",
  "compileReports.columns.waitTime": "Wait Time",
  "compileReports.columns.compileTime": "Compile Time",
  "compileReports.filters.status.placeholder": "Select compile status...",
  "compileReports.filters.test.success": "success",
  "compileReports.tests.filters.result.inProgress": "in progress",

  /** Compile details related text */
  "compileDetails.title": "Compile Details",
  "compileDetails.status.update": "Update",
  "compileDetails.status.trigger": "Trigger",
  "compileDetails.status.envVars": "Environment Variables",
  "compileDetails.errors.title": "Errors",
  "compileDetails.stages.title": "Stages",

  /** Desired State */
  "desiredState.title": "Desired State",
  "desiredState.empty.message": "No desired state versions found",
  "desiredState.columns.resources": "Number of resources",
  "desiredState.columns.labels": "Labels",
  "desiredState.actions.showResources": "Show Resources",
  "desiredState.actions.promote": "Promote",
  "desiredState.actions.promote.failed": "Promoting desired state version failed",
  "desiredState.actions.promote.disabledTooltip": "Promoting this version is not allowed",
  "desiredState.filters.status.placeholder": "Select status...",

  /** Desired State Details */
  "desiredState.resourceDetails.title": "Resource Details",
  "desiredState.compare.title": "Compare",
  "desiredState.compare.versionSeparator": "to",
  "desiredState.compare.action.compare": "Select for compare",
  "desiredState.compare.action.compareWithSelected": "Compare with selected",
  "desiredState.compare.action.compareWithCurrentState": "Compare with current state",
  "desiredState.compare.selectionLabel": "Selected for compare: ",
  "desiredState.compare.empty": "No changes found",
  "desiredState.compare.attributes": (resourceId: string) => `Attributes of ${resourceId}`,
  "desiredState.compare.notPresent": "not present",
  "desiredState.compare.status.modified": "Modified",
  "desiredState.compare.status.added": "Added",
  "desiredState.compare.status.deleted": "Deleted",
  "desiredState.compare.status.agent_down": "Agent down",
  "desiredState.compare.status.undefined": "Undefined",
  "desiredState.compare.status.skipped_for_undefined": "Skipped for undefined",
  "desiredState.compare.status.unmodified": "Unmodified",
  "desiredState.compare.statusLetter.modified": "M",
  "desiredState.compare.statusLetter.added": "A",
  "desiredState.compare.statusLetter.deleted": "D",
  "desiredState.compare.statusLetter.agent_down": "!",
  "desiredState.compare.statusLetter.undefined": "!",
  "desiredState.compare.statusLetter.skipped_for_undefined": "!",
  "desiredState.compare.statusLetter.unmodified": "=",
  "desiredState.compare.resource.typeAndAgent": (type: string, agent: string) =>
    `${type} · ${agent}`,
  "desiredState.compare.filters.resourceCount": (shown: number, hiddenByStatus: number) => {
    const shownText = shown === 1 ? `${shown} resource shown` : `${shown} resources shown`;

    return hiddenByStatus > 0
      ? `${shownText} · ${hiddenByStatus} hidden by status filters`
      : shownText;
  },
  "desiredState.complianceCheck.title": "Compliance Check",
  "desiredState.complianceCheck.failed": "Getting list of dryruns failed",
  "desiredState.complianceCheck.action.dryRun": "Dry run",
  "desiredState.complianceCheck.action.dryRun.failed": "Triggering dryrun failed",
  "desiredState.complianceCheck.action.dryRun.toggle": "Dry run scopes",
  "desiredState.complianceCheck.action.dryRun.fullModel.hint": (count: number) =>
    count === 1 ? `default - ${count} resource` : `default - ${count} resources`,
  "desiredState.complianceCheck.action.dryRun.reportScope": "This report's scope",
  "desiredState.complianceCheck.action.dryRun.reportScope.hint": (count: number) =>
    count === 1 ? `${count} resource` : `${count} resources`,
  "desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.noReport":
    "There is no report yet.",
  "desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.fullModel":
    "This report covers the full model.",
  "desiredState.complianceCheck.action.dryRun.reportScope.blockedBy.unknownStatus":
    "The status of this model version is unknown, so this report's scope can't run.",
  "desiredState.complianceCheck.progress": (checked: number, total: number) =>
    `${checked} / ${total}`,
  "desiredState.complianceCheck.report.title": "Report",
  "desiredState.complianceCheck.scope.title": "Scope",
  "desiredState.complianceCheck.scope.fullModel": "Full model",
  "desiredState.complianceCheck.scope.resources": (count: number) =>
    count === 1 ? "resource" : "resources",
  "desiredState.complianceCheck.scope.resourcesOfTotal": (total: number) =>
    total === 1 ? `of ${total} resource` : `of ${total} resources`,
  "desiredState.complianceCheck.scope.agents": (count: number) =>
    count === 1 ? "agent" : "agents",
  "desiredState.complianceCheck.scope.changed": "changed",
  "desiredState.complianceCheck.scope.notActive": "This version is not active.",
  "desiredState.complianceCheck.scope.notActive.description": (modelVersion: string) =>
    `The diff is what a deploy of ${modelVersion} would have changed when the dry run ran.`,
  "desiredState.complianceCheck.scope.filter.title": "Applied filter",
  // A template PatternFly's LabelGroup fills in, not a JS template string.
  "desiredState.complianceCheck.scope.filter.more": "+${remaining} more",
  "desiredState.complianceCheck.scope.filter.view.label": "Applied filter view",
  "desiredState.complianceCheck.scope.filter.view.structured": "Structured",
  "desiredState.complianceCheck.scope.filter.view.json": "JSON",
  "desiredState.complianceCheck.scope.label.anchor": (names: string[]) => names.join(" › "),
  "desiredState.complianceCheck.scope.label.owned": "+owned",
  "desiredState.complianceCheck.scope.label.more": (count: number) => `+${count}`,
  "desiredState.complianceCheck.scope.label.condition": (row: string, condition: string) =>
    `${row} ${condition}`,
  "desiredState.complianceCheck.scope.label.conditions": (count: number) =>
    `Filtered · ${count} conditions`,
  "desiredState.complianceCheck.scope.operator.eq": (value: string) => `= ${value}`,
  "desiredState.complianceCheck.scope.operator.neq": (value: string) => `not ${value}`,
  "desiredState.complianceCheck.scope.operator.contains": (value: string) => `contains "${value}"`,
  "desiredState.complianceCheck.scope.operator.notContains": (value: string) =>
    `doesn't contain "${value}"`,
  "desiredState.complianceCheck.scope.row.serviceEntity": "Service",
  "desiredState.complianceCheck.scope.row.serviceInstance": "Instance",
  "desiredState.complianceCheck.scope.row.agent": "Agent",
  "desiredState.complianceCheck.scope.row.resourceType": "Type",
  "desiredState.complianceCheck.scope.row.resourceIdValue": "Value",
  "desiredState.complianceCheck.scope.row.purged": "Purged",
  "desiredState.complianceCheck.scope.row.version": "Version",
  "desiredState.complianceCheck.scope.row.status": "Status",
  "desiredState.complianceCheck.scope.row.status.note": "transient",
  "desiredState.complianceCheck.scope.value.latestIntent": "latest intent",
  "desiredState.complianceCheck.scope.value.wasLatestIntent": "was latest intent",
  "desiredState.complianceCheck.scope.value.excludesOrphans": "excludes orphans",
  "desiredState.complianceCheck.scope.value.owned": "owned",
  "desiredState.complianceCheck.scope.value.lifecycleState": (state: string) => `state ${state}`,
  "desiredState.complianceCheck.scope.value.purged.true": "purged",
  "desiredState.complianceCheck.scope.value.purged.false": "not purged",
  "desiredState.complianceCheck.scope.value.isDeploying.true": "deploying",
  "desiredState.complianceCheck.scope.value.isDeploying.false": "not deploying",
  "desiredState.complianceCheck.scope.value.orphansOnly": "orphans only",
  "desiredState.test.skippedCandidate": "skipped_candidate",
  "desiredState.test.candidate": "candidate",

  /** Parameters */
  "parameters.title": "Parameters",
  "parameters.empty.message": "No parameters found",
  "parameters.columns.source": "Source",
  "parameters.filters.name.placeholder": "Filter by name",
  "parameters.filters.source.placeholder": "Filter by source",
};

type OrchestrationEngineMessages = typeof orchestrationEngineMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends OrchestrationEngineMessages {}
}
