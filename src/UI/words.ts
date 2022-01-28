/**
 * This "words" module is responsible for all the text that
 * is presented to the user. This gives a nice overview.
 * If we need to change something, we can do it here.
 * We don't have to find the specific view. Values can also
 * be reused if their meaning is the same.
 *
 * The key should be a meaningful combination of words
 * seperated by dots. Using this method, you can have a
 * value for "inventory", but also for "inventory.state".
 */

const dict = {
  /**
   * General text
   */
  true: "True",
  false: "False",
  submit: "Submit",
  confirm: "Confirm",
  cancel: "Cancel",
  yes: "Yes",
  no: "No",
  null: "null",
  loading: "Loading",
  retry: "Retry",
  delete: "Delete",
  empty: "Empty",

  /**
   * Error related text
   */
  error: "Something went wrong",
  "error.general": (message: string) =>
    `The following error occured: ${message}`,
  "error.environment.missing": "Environment is missing",
  "error.server.intro": (errorMessage: string) =>
    `The following error occured while communicating with the server: ${errorMessage}`,
  "error.authorizationFailed": "Authorization failed, please log in",
  "error.fetch": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "error.image.title": "Invalid image",
  "error.image.unknown": (name: string) =>
    `Something went wrong with file ${name}`,
  "error.image.type": (name: string, type: string) =>
    `File '${name}' is not allowed because of an incorrect file type (${type}). Only jpeg, png, webp and svg images are supported.`,
  "error.image.size": (name: string, size: string) =>
    `File '${name}' is not allowed because of an incorrect file size (${size}). The maximum file size supported is 64 KB.`,

  "notFound.title": "404: We couldn't find that page",
  "notFound.home": "Go home",

  "codehighlighter.lineWrapping.on": "Wrap long lines",
  "codehighlighter.lineWrapping.off": "Don't wrap long lines",
  "codehighlighter.lineNumbers.on": "Show line numbers",
  "codehighlighter.lineNumbers.off": "Hide line numbers",
  "codehighlighter.zoom.on": "Enlarge",
  "codehighlighter.zoom.off": "Back to original size",

  /**
   * Inventory related text
   */
  "id.copy": "Copy full service instance id to clipboard",
  "serviceIdentity.copy": "Copy identifier to clipboard",
  copy: "Copy",
  "copy.feedback": "Copied to clipboard",
  "attributes.active": "Active Attributes",
  "attributes.candidate": "Candidate Attributes",
  "attributes.rollback": "Rollback Attributes",
  "attribute.name": "Name",
  "attributesTab.active": "Active",
  "attributesTab.candidate": "Candidate",
  "attributesTab.rollback": "Rollback",
  "attribute.value.copy": "Copy full value to clipboard",
  "catalog.empty.message": "No services found",
  "empty.title": "There is nothing here",
  "inventory.intro": (service: string) => `Showing instances of ${service}`,
  "inventory.title": "Service Inventory",
  "inventory.empty.message": (service: string) =>
    `No instances found for service ${service}`,
  "inventory.column.id": "Id",
  "inventory.column.state": "State",
  "inventory.column.attributesSummary": "Attributes",
  "inventory.collumn.deploymentProgress": "Deployment Progress",
  "inventory.column.createdAt": "Created",
  "inventory.column.updatedAt": "Updated",
  "inventory.column.resources": "Resources",
  "inventory.tabs.attributes": "Attributes",
  "inventory.tabs.resources": "Resources",
  "inventory.tabs.status": "Status",
  "inventory.statustab.actions": "Actions",
  "inventory.statustab.diagnose": "Diagnose",
  "inventory.statustab.version": "Version",
  "inventory.statustab.details": "Instance Details",
  "inventory.statustab.setInstanceState": "Set state to",
  "inventory.statustab.confirmTitle": "Confirm set state transfer",
  "inventory.statustab.confirmMessage": (id: string, state: string) =>
    `Are you sure you want to set state of instance ${id} to ${state}?`,
  "inventory.statustab.actionDisabled":
    "This action is not supported by the lifecycle in the current state",
  "inventory.statusTab.history": "History",
  "inventory.statusTab.events": "Events",
  "inventory.resourcesTab.empty.title": "No resources found",
  "inventory.resourcesTab.empty.body":
    "No resources could be found for this instance",
  "inventory.resourcesTab.failed.title": "Something went wrong",
  "inventory.resourcesTab.failed.body": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "inventory.resourcesTab.detailsLink": "Jump to Details",
  "inventory.deploymentProgress.inProgress": "In Progress",
  "inventory.deploymentProgress.failed": "Failed",
  "inventory.deploymentProgress.ready": "Ready",
  "inventory.deploymentProgress.total": "Total",
  "inventory.deploymentProgress.notFound": "No resources available yet",
  "inventory.addInstance.title": (serviceName: string) =>
    `Create a new instance of ${serviceName} with the following parameters`,
  "inventory.addInstance.button": "Add instance",
  "inventory.createInstance.title": "Create instance",
  "inventory.createInstance.items": (amount: number) =>
    amount === 1 ? "1 item" : `${amount} items`,
  "inventory.editInstance.button": "Edit",
  "inventory.editInstance.title": "Edit instance",
  "inventory.editInstance.header": (instanceId: string) =>
    `Change attributes of instance ${instanceId}`,
  "inventory.form.typeHint.list": (listBaseType: string) =>
    `A list of ${listBaseType}s, separated by commas`,
  "inventory.form.typeHint.dict":
    'Key-value pairs, following the JSON syntax: {"key": "value"}',
  "inventory.form.placeholder.intList": "1, 2, 3",
  "inventory.form.placeholder.floatList": "1.1, 3.14, 4.3",
  "inventory.form.placeholder.stringList": "value1,value2,value3",
  "inventory.form.placeholder.dict": '{"key": "value"}',
  "inventory.deleteInstance.button": "Delete",
  "inventory.deleteInstance.title": "Delete instance",
  "inventory.deleteInstance.header": (
    instanceId: string,
    serviceName: string
  ) =>
    `Are you sure you want to delete instance ${instanceId} of service entity ${serviceName}?`,
  "inventory.filters.state.placeholder": "Select a state...",

  /**
   * Config related text
   */
  "setting.label.true": "On",
  "setting.label.trueDefault": "On (service default)",
  "setting.label.false": "Off",
  "setting.label.falseDefault": "Off (service default)",
  "config.title": "Config",
  "config.reset": "Reset",
  "config.reset.description": "Reset to service defaults",
  "config.empty": "No settings found",
  "config.disabled": "Changing settings is disabled for deleted instances",

  /**
   * Events related text
   */
  "events.column.date": "Date",
  "events.column.id": "Event id",
  "events.column.instanceVersion": "Instance version",
  "events.column.sourceState": "Source state",
  "events.column.destinationState": "Destination state",
  "events.column.eventType": "Event Type",
  "events.column.message": "Message",
  "events.details.compileReport": "Open compile report",
  "events.empty.title": "No events found",
  "events.empty.body":
    "No events could be found for this instance and the specified filters",
  "events.details.title": "Event details",
  "events.title": "Service Instance Events",
  "events.failed.body": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "events.caption": (id: string) => `Showing events of instance ${id}`,
  "events.filters.source.placeholder": "Select a source state...",
  "events.filters.destination.placeholder": "Select a destination state...",
  "events.filters.eventType.placeholder": "Select an Event Type...",
  "events.filters.date.to": "to",

  /**
   * History related text
   */
  "history.title": "Service Instance History",
  "history.missing": (instanceId: string) =>
    `No history could be found for instance ${instanceId}`,
  "history.tabs.details": "Details",
  "history.tabs.attributes": "Attributes",
  "history.tabs.events": "Events",

  "diagnose.empty": (instanceId: string) =>
    `No errors were found for instance ${instanceId}`,
  "diagnose.failure.title": "Deployment failure",
  "diagnose.links.resourceDetails": "Resource Details",
  "diagnose.links.modelVersionDetails": "Model Version Details",
  "diagnose.links.compileReport": "Compile Report",
  "diagnose.rejection.title": "Validation failure",
  "diagnose.rejection.traceback": "Show full traceback",
  "diagnose.main.subtitle": (instanceId: string) =>
    `The following errors were found related to instance ${instanceId}`,
  "diagnose.title": "Diagnose Service Instance",

  /**
   * Catalog related text
   */
  "catalog.title": "Service Catalog",
  "catalog.summary.title": `Number of instances by label`,
  "catalog.summary.noLabel": "no label",
  "catalog.summary.empty": "No instance summary found",
  "catalog.button.inventory": "Inventory",
  "catalog.delete.title": (serviceName: string) =>
    `Are you sure you want to delete service entity ${serviceName}?`,
  "catalog.instances": "Instances",
  "catalog.callbacks.delete": (url: string) =>
    `Are you sure you want to delete callback with url "${url}"?`,
  "catalog.callbacks.url": "Url",
  "catalog.callbacks.id": "Id",
  "catalog.callbacks.minimalLogLevel": "Minimal Log Level",
  "catalog.callbacks.eventTypes": "Event Types",
  "catalog.callbacks.actions": "Actions",
  "catalog.callbacks.uuid.copy": "Copy full callback id to clipboard",
  "catalog.callbacks.add": "Add",

  /**
   * Environment controls
   */
  "environment.resume.button": "Resume",
  "environment.halt.button": "STOP",
  "environment.halt.title": "Halt environment",
  "environment.halt.details":
    "Are you sure you want to initiate an emergency stop and halt all operations in the current environment?",
  "environment.halt.label": "Operations halted",
  "environment.halt.tooltip": "Operations in this environment are halted",
  "environment.resume.title": "Resume environment",
  "environment.resume.details":
    "Are you sure you want to resume all operations in the current environment?",

  /**
   * Latest released resource view
   */
  "resources.empty.message": "No resources found",
  "resources.column.type": "Type",
  "resources.column.agent": "Agent",
  "resources.column.value": "Value",
  "resources.column.numberOfDependencies": "Number of dependencies",
  "resources.column.deployState": "Deploy State",
  "resources.filters.status.placeholder": "Deploy State...",
  "resources.filters.agent.placeholder": "Agent...",
  "resources.filters.value.placeholder": "Value...",
  "resources.filters.type.placeholder": "Type...",
  "resources.deploySummary.title": "Deployment state summary",
  "resources.deploySummary.deploy": "Deploy",
  "resources.deploySummary.repair": "Repair",
  "resources.details.title": "Resource Details",
  "resources.info.id": "Id",
  "resources.info.lastDeploy": "Last Deploy",
  "resources.info.firstTime": "Created",
  "resources.requires.title": "Requires",
  "resources.requires.empty.message": "No requirements found",
  "resources.requires.resourceId": "Resource Id",
  "resources.requires.deployState": "Deploy State",
  "resources.history.title": "History",
  "resources.history.column.numberOfDependencies": "Number of dependencies",
  "resources.history.column.date": "Date",
  "resources.history.tabs.attributes": "Desired State",
  "resources.history.tabs.requires": "Requires",
  "resources.history.empty.message": "No requirements found",
  "resources.attributes.title": "Desired State",
  "resources.logs.title": "Logs",
  "resources.logs.empty.message": "No logs found",
  "resources.logs.filterOnAction": (actionType: string) =>
    `Filter on '${actionType}'`,
  "resources.logs.timestamp": "Timestamp",
  "resources.logs.actionType": "Action Type",
  "resources.logs.actionType.placeholder": "Action Type...",
  "resources.logs.logLevel": "Log Level",
  "resources.logs.logLevel.placeholder": "Minimal Log Level...",
  "resources.logs.message": "Message",
  "resources.logs.message.placeholder": "Message...",
  "resources.logs.options": "Options",
  "resources.facts.title": "Facts",
  "resources.facts.columns.name": "Name",
  "resources.facts.columns.updated": "Last Updated",
  "resources.facts.columns.value": "Value",

  /** Compile report related text */
  "compileReports.title": "Compile Reports",
  "compileReports.empty.message": "No compile reports found",
  "compileReports.columns.requested": "Requested",
  "compileReports.columns.message": "Message",
  "compileReports.columns.waitTime": "Wait Time",
  "compileReports.columns.compileTime": "Compile Time",
  "compileReports.columns.actions": "Actions",
  "compileReports.columns.inProgress": "In Progress",
  "compileReports.links.details": "Details",
  "compileReports.filters.status.placeholder": "Select compile status...",
  "compileReports.filters.result.placeholder": "Select result...",
  "compileReports.filters.result.success": "Successful",
  "compileReports.filters.result.failed": "Failed",

  /** Compile details related text */
  "compileDetails.title": "Compile Details",
  "compileDetails.status.title": "Status",
  "compileDetails.status.export": "Export",
  "compileDetails.status.update": "Update",
  "compileDetails.status.success": "Success",
  "compileDetails.status.message": "Message",
  "compileDetails.status.trigger": "Trigger",
  "compileDetails.status.envVars": "Environment Variables",
  "compileDetails.errors.title": "Errors",
  "compileDetails.errors.type": "Type",
  "compileDetails.errors.message": "Message",
  "compileDetails.stages.title": "Stages",
  "compileDetails.stages.columns.name": "Name",
  "compileDetails.stages.columns.command": "Command",
  "compileDetails.stages.columns.delay": "Stage start delay",
  "compileDetails.stages.columns.duration": "Duration",
  "compileDetails.stages.columns.returnCode": "Return Code",
  "compileDetails.stages.columns.outstream": "Output Stream",
  "compileDetails.stages.columns.errstream": "Error Stream",
  "compileDetails.stages.copy": "Copy full command to clipboard",

  "home.title": "Home",
  "home.navigation.tooltip": "Go to the overview page",
  "home.navigation.button": "Overview",
  "home.empty.message": "No environments found",
  "home.create.env.desciption": "Create new environment",
  "home.create.env.link": "Create environment",
  "home.environment.icon": (name: string) => `Icon for environment ${name}`,
  "home.environment.select": "Select this environment",
  "home.environment.edit": "Edit environment",
  "home.environment.delete": "Delete environment",
  "home.environment.delete.warning": "Are you absolutely sure?",
  "home.environment.delete.warning.action":
    "I understand the consequences, delete this environment",
  "home.filters.project.placeholder": "Filter by project",
  "home.filters.env.placeholder": "Filter by name",
  "home.environment.copy": "Copy id",

  "createEnv.name": "Name",
  "createEnv.description": "Description",
  "createEnv.projectName": "Project Name",
  "createEnv.repository": "Repository",
  "createEnv.branch": "Branch",
  "createEnv.icon": "Icon",

  /**
   * Navigation related text
   */
  "navigation.lifecycleServiceManager": "Lifecycle Service Manager",
  "navigation.resourceManager": "Resource Manager",
  "navigation.orchestrationEngine": "Orchestration Engine",

  /**
   * Settings
   */
  "settings.title": "Settings",
  "settings.tabs.environment": "Environment",
  "settings.tabs.environment.name": "Name",
  "settings.tabs.environment.description": "Description",
  "settings.tabs.environment.repoSettings": "Repository Settings",
  "settings.tabs.environment.projectName": "Project Name",
  "settings.tabs.environment.icon": "Icon",
  "settings.tabs.environment.id": "Id",
  "settings.tabs.configuration": "Configuration",
  "settings.tabs.tokens": "Tokens",
  "settings.tabs.configuration.default": (value: string) =>
    `Default is ${value}`,
  "settings.tabs.configuration.save": "Save",
  "settings.tabs.configuration.reset": "Reset to default",
  "settings.tabs.token.disabledInfo":
    "An authenticated user is required to create tokens",
  "settings.tabs.token.description":
    "Generate authentication tokens for authorizing agents, api or compiler for this specific environment.",
  "settings.tabs.token.generate": "Generate",

  /**
   * Status
   */
  "status.title": "Orchestrator Status",
  "status.description":
    "The status of the orchestration server, loaded extensions and active components.",

  /** Agents */
  "agents.title": "Agents",
  "agents.empty.message": "No agents found",
  "agents.columns.name": "Name",
  "agents.columns.process": "Process",
  "agents.columns.status": "Status",
  "agents.columns.failover": "Last failover",
  "agents.columns.unpause": "Unpause on resume",
  "agents.columns.actions": "Actions",
  "agents.actions.pause": "Pause",
  "agents.actions.unpause": "Unpause",
  "agents.actions.deploy": "Force deploy",
  "agents.actions.repair": "Force repair",
  "agents.filters.status.placeholder": "Select status...",
  "agents.filters.name.placeholder": "Filter by name",
  "agents.filters.processName.placeholder": "Filter by process name",

  /** Facts */
  "facts.title": "Facts",
  "facts.filters.name.placeholder": "Name...",
  "facts.filters.resourceId.placeholder": "Resource Id...",

  /** Agent Process */
  "agentProcess.title": "Agent Process",
  "agentProcess.hostname": "Hostname",
  "agentProcess.firstSeen": "First seen",
  "agentProcess.lastSeen": "Last seen",
  "agentProcess.expired": "Expired",

  /** Desired State */
  "desiredState.title": "Desired State",
  "desiredState.empty.message": "No desired state versions found",
  "desiredState.columns.date": "Date",
  "desiredState.columns.version": "Version",
  "desiredState.columns.status": "Status",
  "desiredState.columns.resources": "Number of resources",
  "desiredState.columns.labels": "Labels",
  "desiredState.columns.actions": "Actions",
  "desiredState.actions.details": "Details",
  "desiredState.actions.promote": "Promote",
  "desiredState.actions.promote.disabledTooltip":
    "Promoting this version is not allowed",
  "desiredState.filters.status.placeholder": "Select status...",
  "desiredState.filters.version.placeholder": "Filter by version",
  "desiredState.filters.date.placeholder": "Filter by date",

  /** Desired State Details */
  "desiredState.details.title": "Details",
  "desiredState.resourceDetails.title": "Resource Details",

  /**
   * Common
   */
  "common.serviceInstance.select": (attribute: string) =>
    `Select value for ${attribute}`,
  "common.environment.select": "Select an environment...",
  "common.compileWidget.recompile": "Recompile",
  "common.compileWidget.updateAndRecompile": "Update project & recompile",
  "common.compileWidget.compiling": "Compiling",
};

type Key = keyof typeof dict;

export const words = <K extends Key>(key: K): typeof dict[K] => dict[key];
