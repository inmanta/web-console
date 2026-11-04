import { words } from "@inmanta/web-console-core";
import { ServiceEntityShape } from "../ServiceEntityShape";
import { getConnectedLayerData } from "./layerUtils";

/**
 * Lists what is wrong with a shape, one message per problem: the relations it is missing,
 * missing required attributes, and, when its layers are collapsed, problems in the hidden
 * shapes below it. An empty list means the shape is valid.
 *
 * Refreshes the shapes' attribute validation on the way.
 *
 * @param shape - The shape to check
 * @param canvasState - The shapes on the canvas
 * @returns The messages to show for the shape
 */
export const getValidationMessages = (
  shape: ServiceEntityShape,
  canvasState: Map<string, ServiceEntityShape>
): string[] => {
  const messages = shape.getMissingConnections().map((connection) => {
    const displayName =
      connection.entityType && connection.entityType !== connection.name
        ? `${connection.name} (${connection.entityType})`
        : connection.name;

    return connection.required === 1
      ? words("instanceComposer.tooltip.missingConnectionSingle")(displayName)
      : words("instanceComposer.tooltip.missingConnectionMultiple")(
          displayName,
          connection.missing,
          connection.required
        );
  });

  shape.validateAttributes();
  if (shape.hasAttributeValidationErrors) {
    messages.push(words("instanceComposer.tooltip.missingRequiredAttributes"));
  }

  if (shape.isLayersCollapsed) {
    const hasInvalidCollapsed = getConnectedLayerData(canvasState, shape).shapes.some((child) => {
      child.validateAttributes();

      return child.isMissingConnections() || child.hasAttributeValidationErrors;
    });

    if (hasInvalidCollapsed) {
      messages.push(words("instanceComposer.tooltip.collapsedRelationsInvalid"));
    }
  }

  return messages;
};
