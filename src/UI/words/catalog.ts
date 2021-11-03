export default {
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
  "catalog.empty.message": "No services found",
};
