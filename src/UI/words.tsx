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
import React from "react";
import { ParsedNumber } from "@/Core";

const dict = {
  /**
   * General text
   */
  true: "True",
  false: "False",
  submit: "Submit",
  confirm: "Confirm",
  cancel: "Cancel",
  deploy: "Deploy",
  yes: "Yes",
  no: "No",
  null: "null",
  loading: "Loading",
  retry: "Retry",
  delete: "Delete",
  empty: "Empty",
  jumpTo: "Jump to",
  hideAll: "Hide All",
  showAll: "Show All",

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
  "codehighlighter.scrollToBottom": "Scroll down and resume auto-scroll",

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
  "inventory.title": (name: string) => `Service Inventory: ${name}`,
  "inventory.empty.message": (service: string) =>
    `No instances found for service ${service}`,
  "inventory.column.id": "Id",
  "inventory.column.state": "State",
  "inventory.column.attributesSummary": "Attributes",
  "inventory.collumn.deploymentProgress": "Deployment Progress",
  "inventory.column.createdAt": "Created",
  "inventory.column.updatedAt": "Updated",
  "inventory.column.options": "Options",
  "inventory.column.actions": "Actions",
  "inventory.column.resources": "Resources",
  "inventory.actions.drilldown": "More actions",
  "inventory.tabs.attributes": "Attributes",
  "inventory.tabs.collapse": "Collapse all",
  "inventory.tabs.expand": "Expand all",
  "inventory.tabs.resources": "Resources",
  "inventory.tabs.status": "Status",
  "inventory.statustab.actions": "Actions",
  "inventory.statustab.expertActions": "Expert Actions",
  "inventory.statustab.diagnose": "Diagnose",
  "inventory.statustab.version": "Version",
  "inventory.statustab.details": "Instance Details",
  "inventory.statustab.setInstanceState": "Set state to",
  "inventory.statustab.confirmTitle": "Confirm set state transfer",
  "inventory.statustab.confirmMessage": (name: string, state: string) =>
    `Are you sure you want to set state of instance ${name} to ${state}?`,
  "inventory.statustab.forceState": "Force state to",
  "inventory.statustab.forceState.confirmTitle": "Confirm force state transfer",
  "inventory.statustab.forceState.message": (name: string, state: string) =>
    `Are you sure you want to force the state of instance ${name} to ${state}? `,
  "inventory.statustab.forceState.confirmMessage": `Forcing a state might corrupt the service and the orchestrated resources`,
  "inventory.statustab.forceState.confirmQuestion": `Are you sure you want to continue?`,
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
  "inventory.deploymentProgress.waiting": "In Progress",
  "inventory.deploymentProgress.failed": "Failed",
  "inventory.deploymentProgress.deployed": "Ready",
  "inventory.deploymentProgress.notFound": "No resources available yet",
  "inventory.service.failed": "Something went wrong with fetching the service",
  "inventory.addInstance.failed": "Creating instance failed",
  "inventory.addInstance.title": (serviceName: string) =>
    `Create a new instance of ${serviceName} with the following parameters`,
  "inventory.addInstance.button": "Add instance",
  "inventory.addInstance.composerButton": "Add in Composer",
  "inventory.createInstance.title": "Create instance",
  "inventory.createInstance.items": (amount: number) =>
    amount === 1 ? "1 item" : `${amount} items`,
  "inventory.editInstance.button": "Edit",
  "inventory.editInstance.title": "Edit instance",
  "inventory.duplicateInstance.title": "Duplicate instance",
  "inventory.editInstance.failed": "Editing instance failed",
  "inventory.editInstance.noAttributes":
    "There are no attributes to edit. Click confirm to move into the update state",
  "inventory.editInstance.header": (instanceId: string) =>
    `Change attributes of instance ${instanceId}`,
  "inventory.duplicateInstance.header": (instanceId: string) =>
    `Create an instance based of instance ${instanceId}`,
  "inventory.form.typeHint.list": (listBaseType: string) =>
    `A list of ${listBaseType}s`,
  "inventory.form.typeHint.dict":
    'Key-value pairs, following the JSON syntax: {"key": "value"}',
  "inventory.form.placeholder.intList": "1, 2, 3",
  "inventory.form.placeholder.floatList": "1.1, 3.14, 4.3",
  "inventory.form.placeholder.stringList": "Add a list of values",
  "inventory.form.placeholder.dict": '{"key": "value"}',
  "inventory.instanceComposer.labelButtonTooltip": "Toggle connection labels",
  "inventory.instanceComposer.addInstanceButtonTooltip":
    "Add new instance to the canvas.",
  "inventory.instanceComposer.orderDescription":
    "Requested with Instance Composer",
  "inventory.instanceComposer.errorMessage": "missing Instance Model",
  "inventory.instanceComposer.editButton": "Edit in Composer",
  "inventory.instanceComposer.showButton": "Show in Composer",
  "inventory.instanceComposer.formModal.placeholder": "Choose a Service",
  "inventory.instanceComposer.formModal.create.title": "Add Entity",
  "inventory.instanceComposer.formModal.edit.title": "Edit Entity",
  "inventory.instanceComposer.success": "The request got sent successfully",
  "inventory.instanceComposer.success.title": "Instance Composed successfully",
  "inventory.instanceComposer.failed.title": "Instance Composing failed",
  "inventory.instanceComposer.dictModal": (valueName: string) =>
    `Values of ${valueName}`,
  "inventory.instanceComposer.disabled":
    "Your licence doesn't give you access to the Instance Composer, please contact support for more details.",
  "inventory.instanceComposer.title": "Instance Composer",
  "inventory.instanceComposer.title.edit": "Instance Composer Editor",
  "inventory.instanceComposer.title.view": "Instance Composer Viewer",
  "inventory.deleteInstance.button": "Delete",
  "inventory.deleteInstance.failed": "Deleting instance failed",
  "inventory.deleteInstance.title": "Delete instance",
  "inventory.deleteInstance.header": (
    instanceName: string,
    serviceName: string,
  ) =>
    `Are you sure you want to delete instance ${instanceName} of service entity ${serviceName}?`,
  "inventory.destroyInstance.button": "Destroy",
  "inventory.destroyInstance.failed": "Destroying instance failed",
  "inventory.destroyInstance.title": "Destroy instance",
  "inventory.destroyInstance.header": (
    instanceName: string,
    serviceName: string,
  ) =>
    `Are you absolutely sure you want to permanently destroy instance ${instanceName} of service entity ${serviceName}?`,
  "inventory.destroyInstance.text": `This action cannot be undone.`,
  "inventory.deleteVersion.failed": "Deleting version failed",
  "inventory.deleteVersion.title": "Delete version",
  "inventory.deleteVersion.header": (version: ParsedNumber) =>
    `Are you sure you want to delete version ${version}?`,
  "inventory.filters.state.placeholder": "Select a state...",
  "ServiceDetails.title": (name: string) => `Service Details: ${name}`,
  "inventory.test.creating": "creating",
  "inventory.editAttribute.placeholder": "New Attribute",
  "inventory.editAttribute.failed": "Setting new attribute failed",
  "inventory.editAttribute.header": "Update Attribute",
  "inventory.editAttribute.text": (oldValue: string, newValue: string) =>
    `Are you absolutely sure you want to change attribute from ${oldValue} to ${newValue}? This operation can corrupt the instance.`,
  "inventory.error.mermaid": "Error rendering Mermaid diagram",
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
  "config.disabled": "Configuration is not available",

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
  "history.caption": (instanceId: string) =>
    `Showing history for instance ${instanceId}`,
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
   * Orders related text
   */
  "orders.title": "Orders Overview",
  "ordersDetails.title": "Order Details",
  "orders.column.created_at": "Created at",
  "orders.column.completed_at": "Completed at",
  "orders.column.progress": "Deployment Progress",
  "orders.column.status": "Status",
  "orders.column.description": "Description / Order Id",
  "orders.column.option": "Options",
  "orders.column.action": "Action",
  "orders.column.serviceEntity": "Service Entity",
  "orders.column.instanceId": "Instance Id",
  "orders.row.dependencies": "Dependencies",
  "orders.row.config": "Config",
  "orders.row.state": "State",
  "orders.row.details": "Details",
  "orders.row.failureType": "Failure Type",
  "orders.row.reason": "Reason",
  "orders.row.compilerReport": "Show Compile Report",
  "orders.row.body": "Body",
  "orders.table.empty": "No orders could be found.",
  "orderDetails.table.empty": "No orders details could be found.",
  "orders.links.details": "Show Details",
  "orders.row.empty": "Empty",
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
  "catalog.summary.title": `Number of instances by label`,
  "catalog.summary.noLabel": "no label",
  "catalog.summary.empty": "No instance summary found",
  "catalog.button.inventory": "Show inventory",
  "catalog.button.update": "Update Service Catalog",
  "catalog.update.failed": "The update failed",
  "catalog.update.success": "The update has been requested",
  "catalog.update.success.message":
    "We are processing the update of your Service Catalog. The process will be finished after compilation.",
  "catalog.update.modal.title": "Update Request",
  "catalog.delete.modal.title": "Delete Service",
  "catalog.update.confirmation.p1":
    "Are you sure you want to update your Service Catalog? This is an irreversible change and you might want to do a back-up before confirming the update.",
  "catalog.update.confirmation.p2": "This action will:",
  "catalog.update.confirmation.p3": "Update the project",
  "catalog.update.confirmation.p4": "Export the service definition",
  "catalog.update.confirmation.p5":
    "Note: It will not do a regular exporting compile.",
  "catalog.update.tooltip": "Update project and export service definition",
  "catalog.API.tooltip": "Catalog API",
  "catalog.button.details": "Show Details",
  "catalog.delete.title": (serviceName: string) =>
    `Are you sure you want to delete service entity ${serviceName}?`,
  "catalog.delete.failed": "Deleting service entity failed",
  "catalog.instances": "Instances",
  "catalog.callbacks.delete": (url: string) =>
    `Are you sure you want to delete callback with url "${url}"?`,
  "catalog.callbacks.delete.failed": "Deleting callback failed",
  "catalog.callbacks.url": "Url",
  "catalog.callbacks.id": "Id",
  "catalog.callbacks.minimalLogLevel": "Minimal Log Level",
  "catalog.callbacks.eventTypes": "Event Types",
  "catalog.callbacks.actions": "Actions",
  "catalog.callbacks.uuid.copy": "Copy full callback id to clipboard",
  "catalog.callbacks.add": "Add",
  "catalog.table.type": "Type",
  "catalog.table.description": "Description",
  "catalog.table.modifier": "Modifier",

  /**
   * Dashboard
   */
  "dashboard.title": (envName: string) => `Dashboard | ${envName}`,
  "dashboard.refresh": "Refresh",
  "dashboard.lsm.service_count.title": "Service Counter",
  "dashboard.lsm.service_count.description": "The Number of service types",
  "dashboard.lsm.service_count.label.x": "Number of Services [#]",
  "dashboard.lsm.service_instance_count.title": "Service Instances",
  "dashboard.lsm.service_instance_count.description":
    "The number of service instances over time (grouped by state label)",
  "dashboard.lsm.service_instance_count.label.x": "Number of units [#]",
  "dashboard.orchestrator.compile_time.title": "Compile Time",
  "dashboard.orchestrator.compile_time.description":
    "The time (in seconds) required to compile the model",
  "dashboard.orchestrator.compile_time.label.x": "Compile time [s]",
  "dashboard.orchestrator.compile_waiting_time.title": "Compile Waiting Time",
  "dashboard.orchestrator.compile_waiting_time.description":
    "The amount of time (in seconds) a compile request spends waiting in the compile queue before being executed",
  "dashboard.orchestrator.compile_waiting_time.label.x": "Waiting Time [s]",
  "dashboard.orchestrator.compile_rate.title": "Compile Rate",
  "dashboard.orchestrator.compile_rate.description":
    "The rate of compile requests over time (number of compiles per hour)",
  "dashboard.orchestrator.compile_rate.label.x": "Rate of Compiles [#/h]",
  "dashboard.resource.agent_count.title": "Agents Count",
  "dashboard.resource.agent_count.description":
    "The number of agents (grouped by agent state)",
  "dashboard.resource.agent_count.label.x": "Number of Agents [#]",
  "dashboard.resource.resource_count.title": "Resources Count",
  "dashboard.resource.resource_count.description":
    "The number of resources grouped (by resource state)",
  "dashboard.resource.resource_count.label.x": "Number of Resources [#]",
  "dashboard.logout": "Logout",
  "dashboard.documentation.tooltip": "Documentation",
  "dashboard.API.tooltip": "REST API",
  "dashboard.setting.tooltip": "Settings",
  "dashboard.status_page.tooltip": "Status page",
  "dashboard.notifications.tooltip": "Show notifications",

  /**
   * Environment controls
   */
  "environment.resume.button": "Resume",
  "environment.halt.button": "STOP",
  "environment.resume.tooltip":
    "Resume all halted operations in the current environment",
  "environment.halt.button.tooltip":
    "Emergency stop to halt all operations in the current environment",
  "environment.halt.title": "Halt environment",
  "environment.halt.process": "Halting environment",
  "environment.halt.details":
    "Are you sure you want to initiate an emergency stop and halt all operations in the current environment?",
  "environment.halt.label": "Operations halted",
  "environment.halt.tooltip": "Operations in this environment are halted",
  "environment.resume.title": "Resume environment",
  "environment.resume.process": "Resuming environment",
  "environment.resume.details":
    "Are you sure you want to resume all operations in the current environment?",
  "environment.protected.tooltip":
    "This action is not allowed because the environment is protected",

  /**
   * Latest released resource view
   */
  "resources.empty.message": "No resources found",
  "resources.discovery.disabled":
    "Your licence doesn't give you access to the Resource Discovery Feature, please contact support for more details.",
  "resources.column.type": "Type",
  "resources.column.agent": "Agent",
  "resources.column.value": "Value",
  "resources.column.requires": "Requires",
  "resources.column.deployState": "Deploy State",
  "resources.filters.status.placeholder": "Deploy State...",
  "resources.filters.agent.placeholder": "Agent...",
  "resources.filters.value.placeholder": "Value...",
  "resources.filters.type.placeholder": "Type...",
  "resources.filters.reset": "Reset filters",
  "resources.filters.filter": "Add filter",
  "resources.deploySummary.title": "Deployment state summary",
  "resources.deploySummary.deploy": "Deploy",
  "resources.deploySummary.repair": "Repair",
  "resources.link.details": "Show Details",
  "resources.details.title": "Resource Details",
  "resources.info.id": "Id",
  "resources.info.lastDeploy": "Last Deploy",
  "resources.info.firstTime": "Created",
  "resources.requires.title": "Requires",
  "resources.requires.empty.message": "No requirements found",
  "resources.requires.resource": "Resource",
  "resources.requires.deployState": "Deploy State",
  "resources.history.title": "History",
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
  "resources.facts.title": "Facts",
  "resources.facts.columns.name": "Name",
  "resources.facts.columns.updated": "Last Updated",
  "resources.facts.columns.value": "Value",
  "resources.deploy.tooltip":
    "Request the agents to check the current state of each resource in a state different from the deployed state and make the current state of those resources in line with the desired state.",
  "resources.repair.tooltip":
    "Request the agents to check the current state of each resource and make the current state in-line with the desired state.",

  /** Discovered Resources related text */
  "discovered.column.resource_id": "resource_id",
  "discovered_resources.title": "Discovered Resources",
  "discovered_resources.values": "values",

  /** Compile report related text */
  "compileReports.title": "Compile Reports",
  "compileReports.empty.message": "No compile reports found",
  "compileReports.columns.requested": "Requested",
  "compileReports.columns.status": "Status",
  "compileReports.columns.message": "Message",
  "compileReports.columns.waitTime": "Wait Time",
  "compileReports.columns.compileTime": "Compile Time",
  "compileReports.columns.actions": "Actions",
  "compileReports.columns.inProgress": "In Progress",
  "compileReports.links.details": "Show Details",
  "compileReports.filters.status.placeholder": "Select compile status...",
  "compileReports.filters.result.placeholder": "Select result...",
  "compileReports.filters.result.success": "Successful",
  "compileReports.filters.result.failed": "Failed",
  "compileReports.filters.test.success": "success",
  "compileReports.tests.filters.result.inProgress": "in progress",

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
  "home.environment.selector": "Environments",
  "home.environment.delete": "Delete environment",
  "home.environment.clear": "Clear environment",
  "home.environment.delete.warning": "Are you absolutely sure?",
  "home.environment.delete.confirmation": (environment: string) => (
    <>
      This action cannot be undone. This will permanently delete the{" "}
      <b>{environment}</b> environment.
    </>
  ),
  "home.environment.clear.confirmation": (environment: string) => (
    <>
      This action cannot be undone. This will permanently remove everything from
      the <b>{environment}</b> environment and reset it to its initial state.
    </>
  ),
  "home.environment.promtInput": (environment: string) => (
    <>
      Please type <b>{environment}</b> to confirm
    </>
  ),
  "home.environment.delete.warning.action":
    "I understand the consequences, delete this environment",
  "home.environment.clear.warning.action":
    "I understand the consequences, clear this environment",
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
  "navigation.environment": "Environment",
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
  "settings.tabs.token.disabledInfo":
    "An authenticated user is required to create tokens",
  "settings.tabs.token.description":
    "Generate authentication tokens for authorizing agents, api or compiler for this specific environment.",
  "settings.tabs.token.generate": "Generate",
  "settings.update": "Setting Changed",

  /**
   * Status
   */
  "status.title": "Orchestrator Status",
  "status.description":
    "The status of the orchestration server, loaded extensions and active components.",
  "status.supportArchive.action.download": "Download support archive",
  "status.supportArchive.action.downloading": "Fetching support data",

  /** Agents */
  "agents.title": "Agents",
  "agents.empty.message": "No agents found",
  "agents.columns.name": "Name",
  "agents.columns.process": "Process",
  "agents.columns.status": "Status",
  "agents.columns.failover": "Last failover",
  "agents.columns.unpause": "On resume",
  "agents.columns.actions": "Actions",
  "agents.actions.failed": "Agent action failed",
  "agents.actions.pause": "Pause",
  "agents.actions.unpause": "Unpause",
  "agents.actions.deploy": "Force deploy",
  "agents.actions.repair": "Force repair",
  "agents.actions.onResume": "Unpause agent when environment is resumed",
  "agents.filters.status.placeholder": "Select status...",
  "agents.filters.name.placeholder": "Filter by name",
  "agents.filters.processName.placeholder": "Filter by process name",
  "agent.tests.processName": "Process Name",
  "agent.tests.status": "Status",
  "agent.tests.up": "up",

  /** Facts */
  "facts.title": "Facts",
  "facts.filters.name.placeholder": "Name...",
  "facts.filters.resourceId.placeholder": "Resource Id...",
  "facts.column.name": "Name",
  "facts.column.updated": "Updated",
  "facts.column.value": "Value",
  "facts.column.resourceId": "Resource Id",
  "facts.empty.message": "No facts found",

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
  "desiredState.actions.delete": "Delete",
  "desiredState.actions.showResources": "Show Resources",
  "desiredState.actions.promote": "Promote",
  "desiredState.actions.promote.failed":
    "Promoting desired state version failed",
  "desiredState.actions.promote.disabledTooltip":
    "Promoting this version is not allowed",
  "desiredState.filters.status.placeholder": "Select status...",
  "desiredState.filters.version.placeholder": "Filter by version",
  "desiredState.filters.date.placeholder": "Filter by date",

  /** Desired State Details */
  "desiredState.details.title": "Details",
  "desiredState.resourceDetails.title": "Resource Details",
  "desiredState.compare.title": "Compare",
  "desiredState.compare.action.compare": "Select for compare",
  "desiredState.compare.action.compareWithSelected": "Compare with selected",
  "desiredState.compare.action.compareWithCurrentState":
    "Compare with current state",
  "desiredState.compare.selectionLabel": "Compare versions",
  "desiredState.compare.deleted": "This resource has been deleted.",
  "desiredState.compare.deleted.action": "Show attributes",
  "desiredState.compare.unmodified": "This resource has not been modified.",
  "desiredState.compare.agent_down": (agentName: string) =>
    `Could not determine difference because agent ${agentName} is down`,
  "desiredState.compare.undefined":
    "Could not determine difference because this resource has undefined values",
  "desiredState.compare.skipped_for_undefined":
    "Could not determine difference because this resource requires a resource that has undefined values",
  "desiredState.compare.empty": "No changes found",
  "desiredState.compare.file.attributeLabel": "content",
  "desiredState.compare.file.hide": "Hide file contents",
  "desiredState.compare.file.show": "Show file contents",
  "desiredState.complianceCheck.title": "Compliance Check",
  "desiredState.complianceCheck.failed": "Getting list of dryruns failed",
  "desiredState.complianceCheck.action.dryRun": "Perform dry run",
  "desiredState.complianceCheck.action.dryRun.failed":
    "Triggering dryrun failed",
  "desiredState.complianceCheck.noDryRuns": "No dry runs exist",
  "desiredState.test.skippedCandidate": "skipped_candidate",
  "desiredState.test.candidate": "candidate",

  /** Parameters */
  "parameters.title": "Parameters",
  "parameters.empty.message": "No parameters found",
  "parameters.columns.name": "Name",
  "parameters.columns.updated": "Last Updated",
  "parameters.columns.updated.tests": "Updated",
  "parameters.columns.source": "Source",
  "parameters.columns.value": "Value",
  "parameters.filters.name.placeholder": "Filter by name",
  "parameters.filters.source.placeholder": "Filter by source",

  /**
   * Notification
   */
  "notification.read": "Mark as read",
  "notification.unread": "Mark as unread",
  "notification.center.title": "Notification Center",
  "notification.center.empty": "No notifications found",
  "notification.severity.placeholder": "Severity...",
  "notification.read.placeholder": "Read...",
  "notification.message.placeholder": "Message...",
  "notification.title.placeholder": "Title...",
  "notification.drawer.showAll": "Show all notifications",
  "notification.drawer.readAll": "Mark all as read",
  "notification.drawer.clearAll": "Clear all",
  "notification.drawer.details": "Details",
  "notification.drawer.clear": "Clear",
  "notification.instanceForm.prompt":
    "Are you sure you want to leave this page? You have unsaved changes",

  /**
   * Banners
   */
  "banner.entitlement.expired": (days: number) =>
    `Your license has expired ${days} days ago!`,
  "banner.certificate.expired": (days: number) =>
    `Your license has expired ${days} days ago!`,
  "banner.certificate.will.expire": (days: number) =>
    `Your license will expire in ${days} days.`,

  /**
   * Common
   */
  "common.serviceInstance.select": (attribute: string) =>
    `Select value for ${attribute}`,
  "common.serviceInstance.relation": `Select an instance`,
  "common.environment.select": "Select an environment",
  "common.compileWidget.recompile": "Recompile",
  "common.compileWidget.toast": (update: boolean) =>
    `${update ? "Update and " : ""}Recompile triggered`,
  "common.compileWidget.toastTitle": "Recompile Info",
  "common.compileWidget.updateAndRecompile": "Update project & recompile",
  "common.compileWidget.compiling": "Compiling",
  "common.compileWidget.compilationDisabled.hint":
    "The server_compile setting is disabled. You can enable it on the settings page under the configuration tab.",

  /**
   * Login
   */
  "login.title": "Log in to your account",
  "login.subtitle": "Enter your credentials",
  "login.login": "Log in",

  /**
   * User Management
   */
  "userManagement.title": "User Management",
  "userManagement.name": "Name",
  "userManagement.actions": "Actions",
  "userManagement.filter.placeholder": "Username...",
  "userManagement.addUser": "Add User",
  "userManagement.deleteUser.title": "Delete User",
  "userManagement.deleteUserMessage": (username: string) =>
    `Are you sure you want to delete user ${username}?`,
  "userManagement.empty.message": "No users found",
};

type Key = keyof typeof dict;

export const words = <K extends Key>(key: K): (typeof dict)[K] => dict[key];
