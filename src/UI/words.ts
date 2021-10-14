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
  "error.environment.missing": "Environment is missing",
  "error.server.intro": (errorMessage: string) =>
    `The following error occured while communicating with the server: ${errorMessage}`,
  "error.authorizationFailed": "Authorization failed, please log in",
  "error.fetch": (error: string) =>
    `There was an error retrieving data: ${error}`,

  "notFound.title": "404: We couldn't find that page",
  "notFound.back": "Go back",

  /**
   * Inventory related text
   */
  "id.copy": "Copy full service instance id to clipboard",
  "serviceIdentity.copy": "Copy identifier to clipboard",
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
  "events.failed.title": "Something went wrong",
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
  "diagnose.failure.title": "Validation failure",
  "diagnose.links.resourceDetails": "Resource Details",
  "diagnose.links.modelVersionDetails": "Model Version Details",
  "diagnose.links.compileReport": "Compile Report",
  "diagnose.rejection.title": "Deployment failure",
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
  "resources.details.title": "Resource Details",
  "resources.info.title": "Info",
  "resources.info.id": "Id",
  "resources.info.lastDeploy": "Last Deploy",
  "resources.info.firstTime": "Created",
  "resources.info.versionLink": "Open resource version details",
  "resources.details.failed.title": "Something went wrong",
  "resources.details.failed.body": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "resources.requires.title": "Requires",
  "resources.requires.empty.message": "No requirements found",
  "resources.requires.failed.title": "Something went wrong",
  "resources.requires.failed.body": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "resources.requires.resourceId": "Resource Id",
  "resources.requires.deployState": "Deploy State",
  "resources.history.title": "History",
  "resources.history.column.numberOfDependencies": "Number of dependencies",
  "resources.history.column.date": "Date",
  "resources.history.tabs.attributes": "Desired State",
  "resources.history.tabs.requires": "Requires",
  "resources.history.empty.message": "No requirements found",
  "resources.history.failed.title": "Something went wrong",
  "resources.history.failed.body": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "resources.attributes.title": "Desired State",
  "resources.logs.title": "Logs",
  "resources.logs.empty.message": "No logs found",
  "resources.logs.failed.title": "Something went wrong",
  "resources.logs.failed.body": (error: string) =>
    `There was an error retrieving data: ${error}`,
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
  "home.navigation": "Go to overview page",
  "home.empty.message": "No environments found",
  "home.create.env.desciption": "Create new environment",
  "home.create.env.link": "Create environment",
  "home.environment.select": "Select this environment",
  "home.environment.edit": "Edit environment",
  "home.environment.delete": "Delete environment",
  "home.environment.delete.warning": (env: string) =>
    `Deleting an environment is dangerous. Are you sure you want to do delete this environment (${env})? Type the environment name (${env}) as an extra verification that you are sure.`,
  "home.filters.project.placeholder": "Filter by project",
  "home.filters.env.placeholder": "Filter by name",

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
  "settings.tabs.configuration": "Configuration",
  "settings.tabs.tokens": "Tokens",
};

type Key = keyof typeof dict;

export const words = <K extends Key>(key: K): typeof dict[K] => dict[key];
