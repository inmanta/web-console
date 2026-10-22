/**
 * The English messages of the resource manager feature.
 */
export const resourceManagerMessages = {
  /**
   * General text
   */
  include: "Include",
  exclude: "Exclude",

  /**
   * Latest released resource view
   */
  "resources.empty.filterMessage":
    "The given combination of filters didn't match any existing resources, please edit your filter values.",
  "resources.deploying.popover": (count: number) =>
    `${count} ${count === 1 ? "resource is" : "resources are"} currently deploying${
      count > 0 ? ", click to filter" : ""
    }`,
  "resources.deploying.spinner": "Resources deploying",
  "resources.discovery.disabled":
    "Your licence doesn't give you access to the Resource Discovery Feature, please contact support for more details.",
  "resources.column.status.toolTip":
    "Toggle fields to include them in sorting. Drag active fields to set their priority order.",
  "resources.button.statusDetails": "Show status details",
  "resources.popover.title": "Resource State Summary",
  "resources.popover.deploying": "Deploying",
  "resources.popover.lastDeployed": "Last deployed: ",
  "resources.popover.orphan": "Orphan",
  "resources.popover.requirement": "Requirement",
  "resources.popover.requirements": "Requirements",
  "resources.filters.status.isDeploying": "Is Deploying",
  "resources.filters.status.orphaned.label": "Orphaned",
  "resources.filters.status.blocked.label": "Blocked state(s)",
  "resources.filters.status.blocked.placeholder": "Filter by blocked state",
  "resources.filters.status.compliance.label": "Compliance state(s)",
  "resources.filters.status.compliance.placeholder": "Filter by compliance state",
  "resources.filters.status.lastHandlerRun.label": "Handler run state(s)",
  "resources.filters.status.lastHandlerRun.placeholder": "Filter by handler run state",
  "resources.filters.agent.placeholder": "Agent...",
  "resources.filters.value.placeholder": "Value...",
  "resources.filters.type.placeholder": "Type...",
  "resources.filters.reset": "Reset filters",
  "resources.filters.filter": "Add filter",
  "resources.filters.tabs.resource": "Resource",
  "resources.filters.tabs.service": "Service",
  "resources.filters.service.sectionTitle": "Service",
  "resources.filters.service.entity.label": "Service entity",
  "resources.filters.service.entity.placeholder": "Select a service entity",
  "resources.filters.service.entity.selectInfoLabel": "Use text input",
  "resources.filters.service.entity.textInfoLabel": "Use select input",
  "resources.filters.service.entity.loading": "Loading service entities...",
  "resources.filters.service.entity.empty": "No service entities found",
  "resources.filters.service.instance.label": "Instance",
  "resources.filters.service.instance.placeholder": "Select an instance",
  "resources.filters.service.instance.loading": "Loading instances...",
  "resources.filters.service.instance.empty": "No instances found",
  "resources.filters.service.includeOwned.label": "Include owned services",
  "resources.filters.service.includeOwned.description":
    "Also match resources of services owned by the selected instances",
  "resources.filters.service.includeOwned.chipValue": "Included",
  "resources.filters.resource.type.hint":
    "Matches any resource whose type contains this text, ignoring case.",
  "resources.filters.resource.value.hint":
    "Matches any resource whose value contains this text, ignoring case.",
  "resources.filters.resource.agent.hint":
    "Matches any resource whose agent contains this text, ignoring case.",
  "resources.filters.resource.agent.selectInfoLabel": "Use text input",
  "resources.filters.resource.agent.textInfoLabel": "Use select input",
  "resources.filters.resource.agent.loading": "Loading agents...",
  "resources.filters.desiredState.sectionTitle": "Desired State",
  "resources.filters.desiredState.purged": "Purged",
  "resources.filters.active.empty.body":
    "Select filters from the tabs above to refine your results.",
  "resources.sort.label.blocked": "Blocked",
  "resources.sort.label.compliance": "Compliance",
  "resources.sort.label.lastHandlerRun": "Last Handler Run",
  "resources.sort.label.isDeploying": "Is Deploying",
  "resources.details.title": "Resource Details",
  "resources.info.lastDeploy": "Last Deploy",
  "resources.requires.empty.message": "No requirements found",
  "resources.history.tabs.attributes": "Desired State",
  "resources.history.empty.message": "No requirements found",
  "resources.logs.title": "Logs",
  "resources.logs.empty.message": "No logs found",
  "resources.logs.filterOnAction": (actionType: string) => `Filter on '${actionType}'`,
  "resources.logs.actionType": "Action Type",
  "resources.logs.actionType.placeholder": "Action Type...",
  "resources.logs.logLevel": "Log Level",
  "resources.logs.logLevel.placeholder": "Minimal Log Level...",
  "resources.logs.message.placeholder": "Message...",
  "resources.facts.title": "Facts",
  "resources.resourceActions.dryRun.tooltip.resource":
    "Preview what deploying this resource would change, against the version you select. Nothing is deployed.",
  "resources.resourceActions.dryRun.tooltip.resources":
    "Preview what deploying the resources in the chosen scope would change, against the version you select. Nothing is deployed.",
  "resources.resourceActions.deploy.tooltip.resource":
    "Enforce the compliance of this resource. Does nothing if it is already compliant.",
  "resources.resourceActions.repair.tooltip.resource":
    "(Re-)enforce the intent of this resource. Fixes any drift from the desired state, even if it is marked as compliant.",
  "resources.resourceActions.deploy.tooltip.resources":
    "Enforce the compliance of the resources in the chosen scope. Resources that are already compliant are skipped.",
  "resources.resourceActions.repair.tooltip.resources":
    "(Re-)enforce the intent of every resource in the chosen scope. Fixes any drift from the desired state, even for resources marked as compliant.",
  "resources.resourceActions.orphaned.disabled":
    "Orphaned resources are no longer part of the latest desired state, so they cannot be deployed or repaired.",
  "resources.resourceActions.confirm.filtered.title": "Filtered resources",
  "resources.resourceActions.confirm.environment.title": "All resources in this environment",
  "resources.resourceActions.confirm.environment.note": "Ignores the active filter",

  /** Discovered Resources related text */
  "discoveredResourceDetails.title": "Discovered Resource Details",
  "discoveredResourceDetails.empty": "No discovered resource details found",
  "discovered.column.discovery_resource": "Discovery resource",
  "discovered_resources.title": "Discovered Resources",
  "discovered_resources.values": "values",
  "discovered_resources.show_resource.managed": "Show managed resource",
  "discovered_resources.show_resource.discovery": "Show discovery resource",

  /** Agents */
  "agents.title": "Agents",
  "agents.empty.message": "No agents found",
  "agents.columns.process": "Process",
  "agents.columns.failover": "Last failover",
  "agents.columns.unpause": "On resume",
  "agents.actions.failed": "Agent action failed",
  "agents.actions.pause": "Pause",
  "agents.actions.unpause": "Unpause",
  "agents.actions.deploy": "Force deploy",
  "agents.actions.repair": "Force repair",
  "agents.actions.onResume": "Unpause agent when environment is resumed",
  "agents.actions.pauseAll": "Pause all",
  "agents.actions.resumeAll": "Resume all",
  "agents.actions.keepPausedOnResumeAll": "Keep paused on resume",
  "agents.actions.unpauseOnResumeAll": "Unpause on resume",
  "agents.actions.removeAllVenvs": "Remove all agent venvs",
  "agents.actions.pauseAll.requested": "Pausing all agents has been requested",
  "agents.actions.resumeAll.requested": "Resuming all agents has been requested",
  "agents.actions.keepPausedOnResumeAll.requested":
    "Keep paused on resume has been requested for all agents",
  "agents.actions.unpauseOnResumeAll.requested":
    "Unpause on resume has been requested for all agents",
  "agents.actions.removeAllVenvs.requested": "Removal of all agent venvs has been requested",
  "agents.actions.removeAllVenvs.modal.title": "Remove all agent venvs",
  "agents.actions.removeAllVenvs.confirmation.p1":
    "This will remove the virtual environments (venvs) of all agents.",
  "agents.actions.removeAllVenvs.confirmation.p2":
    "This action is asynchronous and might take a long time until the venvs are actually removed, because all executing agent operations will be allowed to finish first.",
  "agents.actions.removeAllVenvs.confirmation.p3":
    "As such, a long deploy operation might delay the removal of the venvs considerably.",
  "agents.filters.status.placeholder": "Select status...",
  "agents.filters.name.placeholder": "Filter by name",
  "agents.filters.processName.placeholder": "Filter by process name",

  /** Facts */
  "facts.title": "Facts",
  "facts.filters.name.placeholder": "Name...",
  "facts.filters.resourceId.placeholder": "Resource Id...",
  "facts.empty.message": "No facts found",
};

type ResourceManagerMessages = typeof resourceManagerMessages;

declare module "@/Core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends ResourceManagerMessages {}
}
