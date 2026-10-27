import { ParsedNumber } from "@inmanta/web-console-core";

/**
 * The English messages of the Lifecycle Service Manager.
 */
export const lsmMessages = {
  /**
   * General text
   */
  "load.previous": "Load previous",
  "load.next": "Load next",

  /**
   * Generic labels reused across views (column headers, tabs, field labels)
   */
  options: "Options",
  attributes: "Attributes",
  events: "Events",
  showMore: "Show more",
  showLess: "Show less",

  /**
   * Inventory related text
   */
  "id.copy": "Copy full service instance id to clipboard",
  "serviceIdentity.copy": "Copy identifier to clipboard",
  "inventory.title": (name: string) => `Service Inventory: ${name}`,
  "inventory.empty.message": (service: string) => `No instances found for service ${service}`,
  "inventory.column.state": "State",
  "inventory.collumn.deploymentProgress": "Deployment Progress",
  "inventory.statustab.diagnose": "Diagnose",
  "inventory.statustab.setInstanceState": "Set state to",
  "inventory.statustab.confirmTitle": "Confirm set state transfer",
  "inventory.statustab.confirmMessage": (name: string, state: string) =>
    `Are you sure you want to set state of instance ${name} to ${state}?`,
  "inventory.resourcesTab.empty.title": "No resources found",
  "inventory.resourcesTab.empty.body": "No resources could be found for this instance.",
  "inventory.deploymentProgress.waiting": "In Progress",
  "inventory.deploymentProgress.failed": "Failed",
  "inventory.deploymentProgress.deployed": "Ready",
  "inventory.deploymentProgress.notFound": "No resources available yet",
  "inventory.addInstance.failed": "Creating instance failed",
  "inventory.addInstance.title": (serviceName: string) =>
    `Create a new instance of ${serviceName} with the following parameters`,
  "inventory.addInstance.button": "Add instance",
  "inventory.createInstance.title": "Create instance",
  "inventory.editInstance.button": "Edit",
  "inventory.editInstance.title": "Edit instance",
  "inventory.duplicateInstance.button": "Duplicate",
  "inventory.duplicateInstance.title": "Duplicate instance",
  "inventory.editInstance.failed": "Editing instance failed",
  "inventory.duplicateInstance.header": (instanceId: string) =>
    `Create an instance based of instance ${instanceId}`,
  "inventory.deleteInstance.failed": "Deleting instance failed",
  "inventory.deleteInstance.title": "Delete instance",
  "inventory.deleteInstance.header": (instanceName: string, serviceName: string) =>
    `Are you sure you want to delete instance ${instanceName} of service entity ${serviceName}?`,
  "inventory.destroyInstance.button": "Destroy",
  "inventory.destroyInstance.failed": "Destroying instance failed",
  "inventory.destroyInstance.title": "Destroy instance",
  "inventory.destroyInstance.header": (instanceName: string, serviceName: string) =>
    `Are you absolutely sure you want to permanently destroy instance ${instanceName} of service entity ${serviceName}?`,
  "inventory.destroyInstance.text": "This action cannot be undone.",
  "inventory.filters.state.label": "State",
  "inventory.filters.state.placeholder": "Select a state...",
  "inventory.filters.id.label": "Id / Service identity",
  "inventory.filters.id.placeholder": "Filter by id or identifier...",
  "inventory.filters.attributeSet.label": "Attribute set (not empty / empty)",
  "inventory.filters.attributeSet.activeLabel": "Attribute set",
  "inventory.filters.attributeSet.active": "Active",
  "inventory.filters.attributeSet.candidate": "Candidate",
  "inventory.filters.attributeSet.rollback": "Rollback",
  "inventory.filters.attributeSet.placeholder": "Filter by attribute set...",
  "inventory.filters.deleted.label": "Deleted",
  "inventory.filters.deleted.include.label": "Include",
  "inventory.filters.deleted.include.description": "Also include deleted instances",
  "inventory.filters.deleted.only.label": "Only",
  "inventory.filters.deleted.only.description": "Only show deleted instances",
  "ServiceDetails.title": (name: string) => `Service Details: ${name}`,
  "inventory.test.creating": "creating",

  /**
   * Service Instance Details text
   */
  "instanceDetails.button": "Show instance",
  "instanceDetails.page.errorFallback": "Something went wrong retrieving the instance details",
  "instanceDetails.page.errorFallback.title": "Error",
  "instanceDetails.page.noData": "There is no data available to display.",
  "instanceDetails.page.noData.errorTitle": "No Data",
  "instanceDetails.history.diagnose": "Diagnose",
  "instanceDetails.history.error": "Error loading Version History",
  "instanceDetails.details.created": "Created:",
  "instanceDetails.details.updated": "Updated:",
  "instanceDetails.tabs.documentation": "Documentation",
  "instanceDetails.tabs.resources.deploymentProgress": "Deployment Progress",
  "instanceDetails.tabs.resources.EmptyResources": "There is no data about deployment progress.",
  "instanceDetails.tabs.documentation.noData":
    "There is no documentation available for this version.",
  "instanceDetails.tabs.events.noData": "There is no events data available for this version.",
  "instanceDetails.tabs.disabled.resources-tooltip":
    "This tab is only available for the latest version.",
  "instanceDetails.documentation.noAttributeForVersion": (attributeName) =>
    `There is no documentation for ${attributeName} in this version.`,
  "instanceDetails.documentation.openPreviewer": "Open in Previewer",
  active_attributes: "Active",
  candidate_attributes: "Candidate",
  rollback_attributes: "Rollback",
  "instanceDetails.resetSort": "Reset sorting",
  "instanceDetails.table.attributeKey": "Attribute",
  "instanceDetails.table.sorting.tooltip": "The sorting can be resetted in the table options.",
  "instanceDetails.setState.label": "Set state",
  "instanceDetails.setState.advanced": "Advanced",
  "instanceDetails.forceState.label": "Force state",
  "instanceDetails.stateTransfer.confirmTitle": "Confirm set state transfer",
  "instanceDetails.expertActions": "Expert Actions",
  "instanceDetails.expert.editModal.title": "Confirm Attributes update",
  "instanceDetails.expert.editModal.message": (selectedSet) => `
  You are performing an update on the ${selectedSet} in expert mode, are you certain you want to proceed?
  `,
  "instanceDetails.expert.confirm.warning": "DANGER: This is an irreversible action!",
  "instanceDetails.expert.forceUpdate": "Force Update",
  "instanceDetails.expert.editModal.success": "Attributes updated successfully",
  "instanceDetails.API.message.update": (username) =>
    username ? `Triggered from the console by ${username}` : "Triggered from the console",
  "instanceDetails.state.noOperation": "no operation",
  "instanceDetails.operation.selectLabel": "Select an operation",
  "instanceDetails.events.column.eventType": "Event type",
  "instanceDetails.events.column.report": "Compile Report",
  "instanceDetails.events.validationReport": "Validation",
  "instanceDetails.events.seeAll": "See all events",

  /**
   * Config related text
   */
  "config.reset": "Reset",
  "config.reset.description": "Reset to service defaults",
  "config.empty": "No settings found",

  /**
   * Events related text
   */
  "events.empty.title": "No events found",
  "events.empty.body": "No events could be found for this instance and the specified filters",
  "events.title": "Service Instance Events",
  "events.caption": (id: string) => `Showing events of instance ${id}`,
  "events.filters.source.placeholder": "Select a source state...",
  "events.filters.destination.placeholder": "Select a destination state...",
  "events.filters.eventType.placeholder": "Select an Event Type...",
  "events.filters.version.placeholder": "Filter by version...",

  /**
   * Diagnose related text
   */
  "diagnose.action": "Apply",
  "diagnose.empty": (instanceId: string) => `No errors were found for instance ${instanceId}`,
  "diagnose.failure.title": "Deployment failure",
  "diagnose.links.resourceDetails": "Resource Details",
  "diagnose.links.modelVersionDetails": "Model Version Details",
  "diagnose.links.compileReport": "Compile Report",
  "diagnose.rejection.title": "Validation failure",
  "diagnose.rejection.traceback": "Show full traceback",
  "diagnose.rejection.errorsCount": (amount: number) => `${amount} errors`,
  "diagnose.rejection.errorCategory": "Category",
  "diagnose.rejection.errorLocation": "Location",
  "diagnose.rejection.showDetails": "Show details",
  "diagnose.rejection.showDetailsAriaLabel": (index: number) => `Show details for error ${index}`,
  "diagnose.rejection.instanceVersion": (version: ParsedNumber) => `Instance version: ${version}`,
  "diagnose.main.subtitle": (instanceId: string) =>
    `The following errors were found related to instance ${instanceId}`,
  "diagnose.title": "Diagnose Service Instance",
  "diagnose.slider.title":
    "The number of lifecycle versions to look back when diagnosing failures.",
  "diagnose.slider.description":
    "The slider determines how many lifecycle versions to look back when diagnosing failures.",

  /**
   * Orders related text
   */
  "orders.title": "Orders Overview",
  "ordersDetails.title": "Order Details",
  "orders.column.created_at": "Created at",
  "orders.column.completed_at": "Completed at",
  "orders.column.progress": "Deployment Progress",
  "orders.column.description": "Description / Order Id",
  "orders.column.action": "Action",
  "orders.column.serviceEntity": "Service Entity",
  "orders.column.instance": "Instance",
  "orders.row.dependencies": "Dependencies",
  "orders.row.config": "Config",
  "orders.row.failureType": "Failure Type",
  "orders.row.reason": "Reason",
  "orders.row.compilerReport": "Show Compile Report",
  "orders.row.body": "Body",
  "orders.table.empty": "No orders could be found.",
  "orderDetails.table.empty": "No orders details could be found.",
  "orders.row.empty": "Empty",
  "orders.row.instanceCreationFailed": "Order failed to create instance.",
  "orders.status.failed": "failed",
  "orders.status.acknowledged": "acknowledged",
  "orders.status.completed": "completed",
  "orders.status.in_progress": "in progress",
  "orders.disabled":
    "Your licence doesn't give you access to the Orders Feature, please contact support for more details.",

  /**
   * Catalog related text
   */
  "catalog.title": "Service Catalog",
  "catalog.empty.message": "No services found",
  "catalog.summary.empty": "No instance summary found",
  "catalog.button.inventory": "Show inventory",
  "catalog.delete.modal.title": "Delete Service",
  "catalog.delete.title": (serviceName: string) =>
    `Are you sure you want to delete service entity ${serviceName}?`,
  "catalog.delete.failed": "Deleting service entity failed",
  "catalog.callbacks.delete.title": "Delete Callback",
  "catalog.callbacks.delete": (url: string) =>
    `Are you sure you want to delete callback with url "${url}"?`,
  "catalog.callbacks.delete.failed": "Deleting callback failed",
  "catalog.callbacks.url": "Url",
  "catalog.callbacks.minimalLogLevel": "Minimal Log Level",
  "catalog.callbacks.eventTypes": "Event Types",
  "catalog.callbacks.uuid.copy": "Copy full callback id to clipboard",

  /**
   * Latest released resource view
   */
  "resources.resourceActions.dryRun.tooltip.instance":
    "Preview what deploying the resources in the chosen scope of this service instance would change, against the version you select. Nothing is deployed.",
  "resources.resourceActions.deploy.tooltip.instance":
    "Enforce the compliance of the resources in the chosen scope of this service instance. Resources that are already compliant are skipped.",
  "resources.resourceActions.repair.tooltip.instance":
    "(Re-)enforce the intent of every resource in the chosen scope of this service instance. Fixes any drift from the desired state, even for resources marked as compliant.",
  "resources.resourceActions.instance.deleted.disabled":
    "This instance is deleted, so its resources can no longer be deployed or repaired.",
  "resources.resourceActions.instance.empty.disabled":
    "This instance has no resources to deploy or repair.",
  "resources.resourceActions.catalog.loading":
    "Loading the service catalog to work out the deploy scope.",
  "resources.resourceActions.catalog.error":
    "The service catalog couldn't be loaded, so the deploy scope is unavailable.",
  "resources.resourceActions.confirm.instance.title": "This instance only",
  "resources.resourceActions.confirm.owned.title": "This instance and owned services",
  "resources.resourceActions.confirm.owned.description": (services: string) =>
    `May also act on owned services of these types: ${services}.`,

  /**
   * Markdown Previewer related text
   */
  "markdownPreviewer.hint.title": "Preview Only",
  "markdownPreviewer.hint.body":
    "This editor is for preview purposes only. Changes made here will not be saved into the service attributes.",
  "markdownPreviewer.pageTitle": (service: string, instance: string) =>
    `Markdown Preview: ${service} - ${instance}`,
  "markdownPreviewer.route.label": (instance: string) => `Markdown Preview: ${instance}`,
};

type LsmMessages = typeof lsmMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends LsmMessages {}
}
