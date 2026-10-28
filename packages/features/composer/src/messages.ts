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
  "instanceComposer.noServiceModel.errorMessage": (serviceName) =>
    `There is no service model available for ${serviceName}`,
  "instanceComposer.errorMessage.coordinatesRequest":
    "Failed to save instance coordinates on deploy.",
  "instanceComposer.editButton": "Edit in Composer",
  "instanceComposer.showButton": "Show in Composer",
  "instanceComposer.formModal.noAttributes": "There are no attribute fields to display.",
  "instanceComposer.formModal.noElementSelected.title": "No details available",
  "instanceComposer.formModal.noElementSelected": "Select an element to display the form.",
  "instanceComposer.failed.title": "Instance Composing failed",
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

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends ComposerMessages {}
}
