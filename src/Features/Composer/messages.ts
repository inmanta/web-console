/**
 * The English messages of the Instance Composer.
 */
export const composerMessages = {
  /**
   * General text
   */
  deploy: "Deploy",

  /**
   * Inventory related text
   */
  "inventory.addInstance.composerButton": "Add in Composer",

  /**
   * Instance Composer text
   */
  "instanceComposer.noData.errorTitle": "No Data",
  "instanceComposer.error.updateInstanceNotInMap":
    "Updated instance is not in the map, if error persists please refresh the page.",
  "instanceComposer.noData.errorMessage": (serviceId) =>
    `There is no data available to display for the given id: ${serviceId}`,
  "instanceComposer.noServiceModel.errorTitle": "No Service Model",
  "instanceComposer.noServiceModel.errorMessage": (serviceName) =>
    `There is no service model available for ${serviceName}`,
  "instanceComposer.labelButtonTooltip": "Toggle connection labels",
  "instanceComposer.addInstanceButtonTooltip": "Add new instance to the canvas.",
  "instanceComposer.errorMessage.missingModel": "The instance attribute model is missing",
  "instanceComposer.errorMessage.coordinatesRequest":
    "Failed to save instance coordinates on deploy.",
  "instanceComposer.editButton": "Edit in Composer",
  "instanceComposer.showButton": "Show in Composer",
  "instanceComposer.formModal.placeholder": "Choose a Service",
  "instanceComposer.formModal.create.title": "Add Entity",
  "instanceComposer.formModal.edit.title": "Edit Entity",
  "instanceComposer.formModal.noAttributes": "There are no attribute fields to display.",
  "instanceComposer.formModal.noElementSelected.title": "No details available",
  "instanceComposer.formModal.noElementSelected": "Select an element to display the form.",
  "instanceComposer.success": "The request got sent successfully",
  "instanceComposer.success.title": "Instance composed successfully",
  "instanceComposer.failed.title": "Instance Composing failed",
  "instanceComposer.dictModal": (valueName: string) => `Values of ${valueName}`,
  "instanceComposer.missingRelations": (name: string, amount: number, relations: string) =>
    `Expected at least ${amount} ${relations} inter-service relation(s) for ${name}`,
  "instanceComposer.contextMenu.cannotRemove": "Cannot remove: required by relation constraints",
  "instanceComposer.tooltip.missingConnectionSingle": (name: string) => `Missing relation: ${name}`,
  "instanceComposer.tooltip.missingConnectionMultiple": (
    name: string,
    missing: number,
    required: number
  ) => `Missing relations: ${name} (${missing}/${required})`,
  "instanceComposer.tooltip.missingRequiredAttributes":
    "This entity has missing required attributes",
  "instanceComposer.tooltip.collapsedRelationsInvalid": "Collapsed relation(s) are not valid",
  "instanceComposer.disabled":
    "Your license doesn't give you access to the Instance Composer, please contact support for more details.",
  "instanceComposer.title": "Instance Composer",
  "instanceComposer.title.edit": "Instance Composer Editor",
  "instanceComposer.title.view": "Instance Composer Viewer",
  "instanceComposer.zoomHandler.fullscreen.toggle": "Toggle full screen",
  "instanceComposer.zoomHandler.fullscreen.exit": "Exit full screen",
  "instanceComposer.zoomHandler.zoomToFit": "Fit to screen",
  "instanceComposer.zoomHandler.zoom": "Slide to zoom",
  "instanceComposer.zoomHandler.zoomIn": "Zoom in",
  "instanceComposer.zoomHandler.zoomOut": "Zoom out",
  "instanceComposer.stencil.new": "New",
  "instanceComposer.stencil.inventory": "Inventory",
  "instanceComposer.halo.expandLayers": "Expand layers",
  "instanceComposer.halo.collapseLayers": "Collapse layers",
  "instanceComposer.halo.expandAllLayers": "Expand all layers",
};

type ComposerMessages = typeof composerMessages;

declare module "@/Core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends ComposerMessages {}
}
