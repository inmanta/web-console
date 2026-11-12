// Loads the words of the shared components into WordsRegistry: this package uses them, and with
// project references a package only sees the declaration merging of the files it imports.
import type {} from "@inmanta/web-console-ui/messages";

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
  "instanceComposer.halo.link": "Link to another entity",
  "instanceComposer.halo.actions": (name: string) => `Actions for ${name}`,
  "instanceComposer.hiddenLayers": (count: number) => `${count} hidden`,
  "instanceComposer.card.unnamed": "Unnamed",
  "instanceComposer.card.notSet": "Not set",
  "instanceComposer.card.relations": (count: number) =>
    count === 1 ? "1 relation" : `${count} relations`,
  "instanceComposer.card.readOnly": "Existing instance: its attributes can't be changed here",
  "instanceComposer.card.issues": (count: number) => (count === 1 ? "1 issue" : `${count} issues`),
  "instanceComposer.label.core": "Service",
  "instanceComposer.label.embedded": "Embedded",
  "instanceComposer.label.relation": "Relation",
  "instanceComposer.label.new": "New",
  "instanceComposer.palette": "Entity palette",
  "instanceComposer.palette.searchEntities": "Search entities",
  "instanceComposer.palette.searchInstances": "Search instances",
  "instanceComposer.palette.hint":
    "Drag an entity onto the canvas, or use + to add it at the centre of the view.",
  "instanceComposer.palette.results": (count: number) =>
    count === 1 ? "1 result" : `${count} results`,
  "instanceComposer.palette.add": (label: string) => `Add ${label} to canvas`,
  "instanceComposer.palette.unavailable": (label: string) => `${label} can't be added again`,
  "instanceComposer.palette.onCanvas": "On canvas",
  "instanceComposer.palette.markedForDeletion": "Marked for deletion",
  "instanceComposer.palette.noResults.title": (query: string) => `No entities match “${query}”`,
  "instanceComposer.palette.noResults.body":
    "Check the spelling, or clear the search to see every service and embedded entity.",
  "instanceComposer.palette.noInstances": "There are no instances to add from the inventory.",
  "instanceComposer.palette.clearSearch": "Clear search",
  "instanceComposer.contextMenu.remove": "Remove from canvas",
  "instanceComposer.contextMenu.remove.description": "Nothing is sent to the orchestrator",
  "instanceComposer.contextMenu.delete": "Delete permanently",
  "instanceComposer.contextMenu.delete.description": "Adds a delete to the order on deploy",
  "instanceComposer.contextMenu.cannotRemove.title": "Can't remove",
  "instanceComposer.contextMenu.cannotRemove.description": "Required by relation constraints",
  "instanceComposer.link.remove": (source: string, target: string) =>
    `Remove the relation between ${source} and ${target}`,
  "instanceComposer.canvas": "Canvas",
  "instanceComposer.overview": "Overview",
  "instanceComposer.zoomHandler.percentage": "Zoom percentage",
  "instanceComposer.arrange": "Arrange",
  "instanceComposer.arrange.all": "Arrange all",
  "instanceComposer.arrange.all.description": "Lays out every entity by relation depth",
  "instanceComposer.arrange.below": (name: string) => `Arrange below ${name}`,
  "instanceComposer.arrange.below.description": "Only the selected entity's subtree moves",
  "instanceComposer.arrange.below.disabled": "Select an entity to arrange what is below it",
  "instanceComposer.arrange.direction": "Direction",
  "instanceComposer.arrange.leftToRight": "Left to right",
  "instanceComposer.arrange.topToBottom": "Top to bottom",
  "instanceComposer.arrange.done.title": "Layout arranged",
  "instanceComposer.arrange.done.body": "The new positions are saved when you deploy.",
  "instanceComposer.arrange.undo": "Undo",
};

type ComposerMessages = typeof composerMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends ComposerMessages {}
}
