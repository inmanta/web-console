import { uniqueId } from "lodash";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";

/**
 * Transforms embedded entities of a service model or an embedded entity into stencil elements.
 *
 * @param {ServiceModel | EmbeddedEntity} service - The service model or embedded entity whose embedded entities are to be transformed.
 * @returns {Array} An array of stencil elements created from the embedded entities
 */
export const transformEmbeddedToStencilElements = (
  service: ServiceModel | EmbeddedEntity,
) => {
  return service.embedded_entities.flatMap((embedded_entity) => {
    const stencilElement = createStencilElement(
      embedded_entity.name,
      embedded_entity,
      undefined,
      true,
      service.name,
    );
    const nestedStencilElements =
      transformEmbeddedToStencilElements(embedded_entity);

    return [stencilElement, ...nestedStencilElements];
  });
};

/**
 * Creates a stencil element with the given parameters.
 *
 * @param {string} name - The name of the stencil element.
 * @param {boolean} isEmbedded - A boolean indicating whether the entity that the stencil represent is embedded or not. Defaults to false.
 * @param {EmbeddedEntity} entityModel - The embedded entity model associated with the entity that the stencil element represent. Optional.
 * @param {string} holderName - The name of the holder of the element that the stencil element represent. Optional.
 * @returns {Object} An object representing the stencil element.
 */
export const createStencilElement = (
  name: string,
  serviceModel: EmbeddedEntity | ServiceModel | undefined = undefined,
  instanceAttributes: InstanceAttributeModel | undefined = undefined,
  isEmbedded: boolean = false,
  holderName?: string,
) => {
  return {
    type: "standard.Path",
    size: { width: 240, height: 40 },
    name: name,
    serviceModel,
    instanceAttributes,
    holderName,
    disabled: false,
    id: instanceAttributes?.id || uniqueId(),
    attrs: {
      body: {
        class: name + "_body",
        width: 7,
        height: 40,
        x: 233,
        fill: isEmbedded ? "#0066cc" : "#6753AC",
        stroke: "none",
      },
      bodyTwo: {
        class: name + "_bodyTwo",
        width: 240,
        height: 40,
        fill: "#FFFFFF",
        stroke: "none",
      },
      label: {
        class: name + "_text",
        refX: null, // reset the default
        x: "10",
        textAnchor: "start",
        fontFamily: "sans-serif",
        fontSize: 12,
        text: name,
      },
    },
    markup: [
      {
        tagName: "rect",
        selector: "bodyTwo",
      },
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],
  };
};
