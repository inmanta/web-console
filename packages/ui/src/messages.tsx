/**
 * The English messages of the shared components, and the words several features use.
 */
export const uiMessages = {
  /**
   * General text
   */
  true: "True",
  false: "False",
  confirm: "Confirm",
  cancel: "Cancel",
  collapse: "Collapse",
  expand: "Expand",
  yes: "Yes",
  no: "No",
  null: "null",
  loading: "Loading",
  retry: "Retry",
  add: "Add",
  delete: "Delete",
  empty: "Empty",
  jumpTo: "Jump to",
  hideAll: "Hide All",
  showAll: "Show All",
  edit: "Edit",
  details: "Details",
  remove: "Remove",
  username: "Username",
  password: "Password",
  copy: "Copy",
  "copy.raw": "Copy raw value",
  "copy.clipboard": "Copy to clipboard",
  resize: (name: string) => `Resize ${name}`,
  "info.title": "Info",
  noResults: "No results found",

  /**
   * Generic labels reused across views (column headers, tabs, field labels)
   */
  name: "Name",
  status: "Status",
  value: "Value",
  type: "Type",
  id: "Id",
  agent: "Agent",
  message: "Message",
  description: "Description",
  version: "Version",
  date: "Date",
  timestamp: "Timestamp",
  actions: "Actions",
  created: "Created",
  updated: "Updated",
  lastUpdated: "Last Updated",
  showDetails: "Show Details",
  resources: "Resources",
  history: "History",
  requires: "Requires",
  filters: "Filters",
  collapseAll: "Collapse all",
  expandAll: "Expand all",
  export: "Export",
  resourceId: "Resource Id",
  versionLabel: (version: string) => `Version: ${version}`,
  modelVersion: (modelVersion: number | string) => `v${modelVersion}`,
  instanceVersion: (instanceVersion: number | string) => `instance v${instanceVersion}`,

  /**
   * Error related text
   */
  error: "Something went wrong",
  "error.title": "Error",
  "error.unknown": "Unknown error",
  "error.general": (message: string) => `The following error occured: ${message}`,
  "error.environment.missing": "Environment is missing",
  "error.image.title": "Invalid image",
  "error.image.unknown": (name: string) => `Something went wrong with file ${name}`,
  "error.image.type": (name: string, type: string) =>
    `File '${name}' is not allowed because of an incorrect file type (${type}). Only jpeg, png, webp and svg images are supported.`,
  "error.image.size": (name: string, size: string) =>
    `File '${name}' is not allowed because of an incorrect file size (${size}). The maximum file size supported is 64 KB.`,
  "validation.title": (amount: number) => `Errors found: ${amount}`,
  "validation.empty": "Invalid JSON",

  /**
   * Inventory related text
   */
  "copy.feedback": "Copied to clipboard",
  "attributes.emptyString": "empty string",
  "attributesTab.active": "Active",
  "attributesTab.candidate": "Candidate",
  "attributesTab.rollback": "Rollback",
  "attribute.value.copy": "Copy full value to clipboard",
  "empty.title": "There is nothing here",
  "inventory.statustab.actionDisabled":
    "This action is not supported by the lifecycle in the current state",
  "inventory.service.failed": "Something went wrong with fetching the service",
  "inventory.createInstance.items": (amount: number) =>
    amount === 1 ? "1 item" : `${amount} items`,
  "inventory.form.withInitialState": "With initial state",
  "inventory.form.validationErrors.title": (count: number) =>
    `The orchestrator rejected ${count} ${count === 1 ? "value" : "values"}`,
  "inventory.form.validationErrors.item": (path: string, message: string) => (
    <>
      <b>{path}</b>: {message}
    </>
  ),
  "inventory.form.validationErrors.messageSeparator": "; ",
  "inventory.editInstance.noAttributes":
    "There are no attributes to edit. Click confirm to move into the update state",
  "inventory.form.suggestions.waitingOnSource": (dependencies: string) =>
    `Waiting on ${dependencies} before suggestions become available.`,
  "inventory.form.suggestions.empty": (dependencies: string) =>
    `No suggested values are available for the current values of ${dependencies}.`,
  "inventory.form.suggestions.notInList": (dependencies: string) =>
    `The current value is not among the suggested values for ${dependencies}.`,
  "inventory.form.suggestions.fetchError": "Could not load the suggested values. Please try again.",
  "inventory.form.suggestions.loading": "Loading suggestions...",
  "inventory.form.suggestions.missingDependency": (field: string, reference: string) =>
    `The suggested values for '${field}' reference '${reference}', which is not a field in scope.`,
  "inventory.form.suggestions.dependencyCycle": (cycle: string) =>
    `The suggested values form a dependency cycle: ${cycle}. Dependencies between fields must be acyclic.`,
  "inventory.form.suggestions.moreResults": (shown: number, total: number) =>
    `Showing the first ${shown} of ${total} suggestions. Refine your search to narrow the results.`,
  "inventory.form.tabs.invalidCatalog":
    "The web_tabs entity annotation is malformed. Every tab requires a unique string 'key' and a string 'label'.",
  "inventory.form.tabs.defaultRequired": (count: number) =>
    `The web_tabs entity annotation must mark exactly one tab as default, but ${count} tabs are marked.`,
  "inventory.form.tabs.unknownKey": (fieldName: string, tabKey: string) =>
    `Field "${fieldName}" is assigned to tab "${tabKey}", which is not defined in the web_tabs entity annotation.`,
  "inventory.form.typeHint.list": (listBaseType: string) => `A list of ${listBaseType}s`,
  "inventory.form.typeHint.dict": 'Key-value pairs, following the JSON syntax: {"key": "value"}',
  "inventory.form.placeholder.intList": "1, 2, 3",
  "inventory.form.placeholder.floatList": "1.1, 3.14, 4.3",
  "inventory.form.placeholder.stringList": "Add a list of values",
  "inventory.form.placeholder.dict": '{"key": "value"}',
  "inventory.form.button": "Form",
  "inventory.editor.button": "JSON-Editor",

  /**
   * Service Instance Details text
   */
  "instanceDetails.searchPlaceholder": "Search version…",
  "instanceDetails.events.dateTooltip": (dateDiff: string) => `${dateDiff} since last event`,

  /**
   * Config related text
   */
  "setting.label.true": "On",
  "setting.label.trueDefault": "On (service default)",
  "setting.label.false": "Off",
  "setting.label.falseDefault": "Off (service default)",

  /**
   * Events related text
   */
  "events.column.instanceVersion": "Instance version",
  "events.column.sourceState": "Source state",
  "events.column.destinationState": "Destination state",
  "events.column.eventType": "Event Type",
  "events.details.compileReport": "Open compile report",
  "events.details.title": "Event details",

  /**
   * Catalog related text
   */
  "catalog.summary.title": "Number of instances by label",
  "catalog.summary.noLabel": "no label",
  "catalog.summary.total": (total: number) => (
    <>
      <b>{total}</b> {total === 1 ? "instance" : "instances"}
    </>
  ),
  "catalog.button.update": "Update Service Catalog",
  "catalog.update.failed": "The update failed",
  "catalog.update.success": "The update has been requested",
  "catalog.update.success.message":
    "We are processing the update of your Service Catalog. The process will be finished after compilation.",
  "catalog.update.modal.title": "Update Request",
  "catalog.update.confirmation.p1":
    "Are you sure you want to update your Service Catalog? This is an irreversible change and you might want to do a back-up before confirming the update.",
  "catalog.update.confirmation.p2": "This action will:",
  "catalog.update.confirmation.p3": "Update the project",
  "catalog.update.confirmation.p4": "Export the new resources",
  "catalog.update.confirmation.p5": "Note: It will perform two consecutive compiles.",
  "catalog.update.tooltip": "Update project and export service definition",
  "catalog.API.tooltip": "Catalog API",
  "catalog.callbacks.add": "Add",
  "catalog.table.modifier": "Modifier",

  /**
   * Environment controls
   */
  "environment.halt.process": "Halting environment",
  "environment.halt.tooltip": "Operations in this environment are halted",
  "environment.resume.process": "Resuming environment",

  /**
   * Latest released resource view
   */
  "resources.empty.message": "No resources found",
  "resources.filters.resource.type.placeholder": "Resource type...",
  "resources.filters.resource.value.placeholder": "Value...",
  "resources.filters.resource.agent.label": "Agent(s)",
  "resources.filters.resource.agent.placeholder": "Select Agent(s)",
  "resources.filters.active.title": "Active filters",
  "resources.filters.active.resetFilters": "Reset Filters",
  "resources.filters.active.empty.title": "No filters applied",
  "resources.filters.active.empty.body.noTabs":
    "Use the fields above to add filters and refine your results.",
  "resources.filters.active.group.close": (group: string) => `Remove ${group} filters`,
  "resources.status.label.blocked": "Blocked",
  "resources.status.label.compliance": "Compliance",
  "resources.status.label.lastHandlerRun": "Last Handler Run",
  "resources.compoundStateSummary.title": "Compound state summary",
  "resources.compoundStateSummary.deploy": "Deploy",
  "resources.compoundStateSummary.repair": "Repair",
  "resources.requires.resource": "Resource",
  "resources.requires.deployState": "Deploy State",
  "resources.attributes.title": "Desired State",
  "resources.attributes.view.label": "Attribute view",
  "resources.attributes.view.structured": "Structured",
  "resources.attributes.view.json": "JSON",
  "resources.attributes.modelGroup": "Attributes",
  "resources.attributes.orchestratorGroup": "Orchestrator attributes",
  "references.chip.tooltip": "resolved at deploy time",
  "references.uuid.copy": "Copy reference id",
  "references.unresolved.marker": "unresolved",
  "references.unresolved.tooltip": "This reference could not be found in the payload",
  "references.cycle.marker": "cycle",
  "references.cycle.tooltip": "This reference repeats one of its parents",
  "references.argumentKind.literal": "literal",
  "references.argumentKind.json": "json",
  "references.argumentKind.mjson": "json",
  "references.argumentKind.reference": "reference",
  "references.argumentKind.resource": "resource",
  "references.argumentKind.python_type": "python type",
  "references.argumentKind.get": "dict path",
  "references.mutatorsNotDisplayed": (count: number) =>
    `${count} ${count === 1 ? "mutator is" : "mutators are"} not displayed`,
  "resources.file.get": "Get file",
  "resources.file.error": "Error fetching file content",
  "resources.resourceActions.toggle": "Deploy actions",
  "resources.resourceActions.deploy.hint": "default - incremental",
  "resources.resourceActions.repair.hint": "full",
  "resources.resourceActions.dryRun": "Dry run",
  "resources.resourceActions.dryRun.hint": "preview, no change",
  "resources.resourceActions.triggered": (action: string) => `${action} triggered`,
  "resources.resourceActions.failed": (action: string) =>
    `Triggering ${action.toLowerCase()} failed`,
  "resources.resourceActions.confirm.title": (action: string) => `${action} resources`,
  "resources.resourceActions.confirm.description": "Choose the scope, then confirm.",
  "resources.resourceActions.confirm.single.title": (action: string) => `${action} this resource`,
  "resources.resourceActions.confirm.titleFor": (action: string, subject: string) =>
    `${action} ${subject}`,
  "resources.resourceActions.confirm.dryRun.description": "Preview the diff. Nothing is deployed.",
  "resources.resourceActions.confirm.dryRun.instance.description":
    "Preview the diff for this instance's resources. Nothing is deployed.",
  "resources.resourceActions.confirm.scope.title": "Scope",
  "resources.resourceActions.confirm.version.title": "Against version",
  "resources.resourceActions.confirm.version.type.title": "Version type",
  "resources.resourceActions.confirm.version.type.instanceVersion": "Instance version",
  "resources.resourceActions.confirm.version.type.modelVersion": "Model version",
  "resources.resourceActions.confirm.version.arrow": "→",
  "resources.resourceActions.confirm.version.mapsTo": (modelVersion: string) =>
    `model v${modelVersion}`,
  "resources.resourceActions.confirm.version.mapsTo.none": "no model version",
  "resources.resourceActions.confirm.version.noModelVersion.selected": (instanceVersion: string) =>
    `Instance v${instanceVersion} has no model version, so it can't be dry-run.`,
  "resources.resourceActions.confirm.version.noModelVersion.default": (instanceVersion: string) =>
    `Instance v${instanceVersion} has no model version yet, so the dry run uses the active model version.`,
  "resources.resourceActions.confirm.version.placeholder": "Select a version",
  "resources.resourceActions.confirm.version.search": "Search a version number",
  "resources.resourceActions.confirm.version.searchHint":
    "Scroll the list to load older versions, or type a version number to find it.",
  "resources.resourceActions.confirm.version.noResults": "No version found",
  "resources.resourceActions.confirm.version.lookupError": (version: string) =>
    `Version ${version} couldn't be looked up.`,
  "resources.resourceActions.confirm.version.moreInfo": "More info about the version",
  "resources.resourceActions.confirm.version.blockedBy.statusFilter":
    "Status filters only apply to the active model version.",
  "resources.resourceActions.confirm.version.blockedBy.ownedServices":
    "Owned services can only be previewed against the active model version.",
  "resources.resourceActions.confirm.version.loadError":
    "The versions couldn't be loaded, so the dry run uses the active model version.",
  "resources.resourceActions.confirm.scope.count": (count: number) =>
    `${count} resource${count === 1 ? "" : "s"}`,
  "resources.resourceActions.confirm.orphanNote":
    "Orphaned resources (in no released version) can't be deployed, repaired or dry-run.",

  /** Agents */
  "agent.tests.up": "up",

  /** Desired State Details */
  "desiredState.compare.changes": (resourceId: string) => `Changes of ${resourceId}`,
  "desiredState.compare.deleted": "This resource has been deleted.",
  "desiredState.compare.deleted.action": "Show attributes",
  "desiredState.compare.unmodified": "This resource has not been modified.",
  "desiredState.compare.agent_down": (agentName: string) =>
    `Could not determine difference because agent ${agentName} is down`,
  "desiredState.compare.undefined":
    "Could not determine difference because this resource has undefined values",
  "desiredState.compare.skipped_for_undefined":
    "Could not determine difference because this resource requires a resource that has undefined values",
  "desiredState.compare.file.attributeLabel": "content",
  "desiredState.compare.file.hide": "Hide file contents",
  "desiredState.compare.file.show": "Show file contents",
  "desiredState.complianceCheck.report.view": "View report",
  "desiredState.complianceCheck.report.started": "Dry run started",

  /**
   * Notification
   */
  "notification.instanceForm.prompt":
    "Are you sure you want to leave this page? You have unsaved changes",

  /**
   * Banners
   */
  "banner.expertMode": "LSM expert mode is enabled, proceed with caution. ",
  "banner.certificate.will.expire": (days: number) => `Your license will expire in ${days} days.`,
  "banner.license.expired": (days: number) => `Your license has expired ${days} days ago!`,
  "banner.disableExpertMode": "Disable expert mode",

  /**
   * Common
   */
  "common.serviceInstance.select": (attribute: string) => `Select value for ${attribute}`,
  "common.serviceInstance.relation": (serviceEntity: string) =>
    `Select an instance of ${serviceEntity}`,
  "common.serviceInstance.relations": (serviceEntity: string) =>
    `Select instances of ${serviceEntity}`,
  "common.compileWidget.recompile": "Recompile",
  "common.compileWidget.toast": (update: boolean, reinstall) =>
    `${update ? "Update and " : reinstall ? "Cleanup and " : ""}Recompile triggered`,
  "common.compileWidget.updateAndRecompile": "Update project & recompile",
  "common.compileWidget.cleanupAndRecompile": "Cleanup project & recompile",
  "common.compileWidget.compilationDisabled.hint":
    "The server_compile setting is disabled. You can enable it on the settings page under the configuration tab.",
  "common.emptyColumnHeader": "Column header for collapsible-expandable action",
  "theme.toggle": (theme: string) => `Switch to ${theme === "dark" ? "light" : "dark"} mode`,

  /**
   * User Management
   */
  "userManagement.title": "User Management",

  /**
   * Markdown Container related text
   */
  "markdownContainer.setState.error.invalidConfigArray":
    "⚠ Invalid configuration: expected object, got array",
  "markdownContainer.setState.error.invalidConfig": "⚠ Invalid configuration: expected object",
  "markdownContainer.setState.error.missingTargetState":
    "⚠ Missing configuration: provide 'targetState'",
  "markdownContainer.setState.error.cannotParseJson":
    "⚠ Invalid configuration: Can't parse JSON object",
  "markdownContainer.download.svg": "↓ SVG",
  "markdownContainer.download.svg.title": "Download as SVG",
  "markdownContainer.download.png": "↓ PNG",
  "markdownContainer.download.png.title": "Download as PNG",
  "markdownContainer.error.mermaid.title": "Error rendering Mermaid diagram:",

  /**
   * Shared filter-drawer range inputs (TimestampRangeFilter / IntRangeFilter)
   */
  "filters.timestamp.from.datePicker": "From Date Picker",
  "filters.timestamp.from.timePicker": "From Time Picker",
  "filters.timestamp.to.datePicker": "To Date Picker",
  "filters.timestamp.to.timePicker": "To Time Picker",
  "filters.timestamp.from.apply": "Apply date from filter",
  "filters.timestamp.to.apply": "Apply date to filter",
  "filters.from": "From",
  "filters.to": "To",
  "filters.range.from.input": (label: string) => `${label} range from`,
  "filters.range.to.input": (label: string) => `${label} range to`,
  "filters.range.from.apply": (label: string) => `Apply ${label} from filter`,
  "filters.range.to.apply": (label: string) => `Apply ${label} to filter`,

  /**
   * LogViewer related text
   */
  "logViewer.selectLog": "Select log",
  "logViewer.search": "Search",
  "logViewer.duration": (duration: string) => `Duration: ${duration} s`,
  "logViewer.autoscroll.resume": "Resume Autoscroll",
  "logViewer.autoscroll.pause": "Pause Autoscroll",
  "logViewer.download": "Download",
  "logViewer.download.aria": "Download current logs",

  /**
   * UnitInputField (issue #7022 / #7131)
   */
  "unitInput.unitSelect.ariaLabel": "Unit",
  "unitInput.durationUnit.ns": "nanoseconds",
  "unitInput.durationUnit.us": "microseconds",
  "unitInput.durationUnit.ms": "milliseconds",
  "unitInput.durationUnit.s": "seconds",
  "unitInput.durationUnit.min": "minutes",
  "unitInput.durationUnit.h": "hours",
  "unitInput.durationUnit.d": "days",
  "unitInput.helper.stored": (value: string, unit: string) => `= ${value} ${unit}`,
  "unitInput.helper.equivalent": (value: string, unit: string, family: string) =>
    `≈ ${value} ${unit} (${family})`,
  "unitInput.error.notANumber": "Enter a number.",
  "unitInput.error.notExact": (entered: string, unit: string, apiValue: string, apiUnit: string) =>
    `Must be a whole number of ${apiUnit} (${entered} ${unit} = ${apiValue} ${apiUnit}).`,
  "unitInput.error.bound.ge": (limit: string, unit: string) => `Must be at least ${limit} ${unit}.`,
  "unitInput.error.bound.gt": (limit: string, unit: string) =>
    `Must be more than ${limit} ${unit}.`,
  "unitInput.error.bound.le": (limit: string, unit: string) => `Must be at most ${limit} ${unit}.`,
  "unitInput.error.bound.lt": (limit: string, unit: string) =>
    `Must be less than ${limit} ${unit}.`,
};

type UiMessages = typeof uiMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends UiMessages {}
}
