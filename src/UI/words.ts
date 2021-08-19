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

  /**
   * Latest released resource view
   */
  "resources.empty.message": "No resources found",
  "resources.column.type": "Type",
  "resources.column.agent": "Agent",
  "resources.column.value": "Value",
  "resources.column.numberOfDependencies": "Number of dependencies",
  "resources.column.deployState": "Deploy State",
  "resources.filters.status.placeholder": "Select a Deploy State...",
  "resources.filters.agent.placeholder": "Search for an agent...",
  "resources.filters.value.placeholder": "Search for a value...",
  "resources.filters.type.placeholder": "Search for a type...",
  "resources.details.title": "Details",
  "resources.details.id": "Id",
  "resources.details.lastDeploy": "Last Deploy",
  "resources.details.firstTime": "Created",
  "resources.details.history": "History",
  "resources.details.versionLink": "Open resource version details",
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
  "resources.history.column.numberOfDependencies": "Number of dependencies",
  "resources.history.column.date": "Date",
  "resources.history.tabs.attributes": "Desired State",
  "resources.history.tabs.requires": "Requires",
  "resources.history.empty.message": "No requirements found",
  "resources.history.failed.title": "Something went wrong",
  "resources.history.failed.body": (error: string) =>
    `There was an error retrieving data: ${error}`,
  "resources.attributes.title": "Desired State",

  /**
   * Navigation related text
   */
  "navigation.lifecycleServiceManager": "Lifecycle Service Manager",
  "navigation.resourceManager": "Resource Manager",
};

type Key = keyof typeof dict;

export const words = <K extends Key>(key: K): typeof dict[K] => dict[key];
