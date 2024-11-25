import { shapes } from "@inmanta/rappid";
import { global_palette_white } from "@patternfly/react-tokens";
import { v4 as uuidv4 } from "uuid";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { HeaderColor } from "../interfaces";

/**
 * It recursively goes through embedded entities in the service model or embedded entity and creates stencil elements for each of them.
 * Stencil Elements are the visual representation of the entities in the Stencil Sidebar
 *
 * @param {ServiceModel | EmbeddedEntity} service - The service model or embedded entity whose embedded entities are to be transformed.
 *
 * @returns {shapes.standard.Path[]} An array of stencil elements created from the embedded entities
 */
export const transformEmbeddedToStencilElements = (
  service: ServiceModel | EmbeddedEntity,
): shapes.standard.Path[] => {
  return service.embedded_entities
    .filter((embedded_entity) => embedded_entity.modifier !== "r") // filter out read-only embedded entities from the stencil as they can't be created by the user
    .flatMap((embedded_entity) => {
      const stencilElement = createStencilElement(
        embedded_entity.name,
        embedded_entity,
        {},
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
 * @param {EmbeddedEntity | ServiceModel} serviceModel - The embedded entity model associated with the entity that the stencil element represent.
 * @param {InstanceAttributeModel} instanceAttributes - The instance attributes of the entity that the stencil element represent.
 * @param {boolean} isEmbedded - A boolean indicating whether the entity that the stencil represent is embedded or not. Defaults to false.
 * @param {string} holderName - The name of the holder of the element that the stencil element represent. Optional.
 *
 * @returns {shapes.standard.Path} An object representing the stencil element.
 */
export const createStencilElement = (
  name: string,
  serviceModel: EmbeddedEntity | ServiceModel,
  instanceAttributes: InstanceAttributeModel,
  isEmbedded: boolean = false,
  holderName?: string,
): shapes.standard.Path => {
  let id = uuidv4();

  if (instanceAttributes && instanceAttributes.id) {
    id = instanceAttributes.id as string;
  }

  return new shapes.standard.Path({
    type: "standard.Path",
    size: { width: 240, height: 40 },
    name: name,
    serviceModel,
    instanceAttributes,
    holderName,
    disabled: false,
    id,
    attrs: {
      body: {
        class: "body_" + name,
        width: 7,
        height: 40,
        x: 233,
        fill: isEmbedded ? HeaderColor.EMBEDDED : HeaderColor.RELATION,
        stroke: "none",
      },
      bodyTwo: {
        class: "bodyTwo_" + name,
        width: 240,
        height: 40,
        fill: global_palette_white.var,
        stroke: "none",
      },
      label: {
        class: "text_" + name,
        refX: undefined, // reset the default
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
  });
};

/**
 * Changes the availability of stencil elements by toggling their CSS classes.
 *
 * This function enables or disables stencil elements for an inter-service relation instance by toggling specific CSS classes.
 *
 * @param {string} stencilName - The name of the stencil.
 * @param {"enable" | "disable"} action - The action to perform, either "enable" or "disable".
 *
 * @returns {void}
 */
export const changeStencilElementAvailability = (
  stencilName: string,
  action: "enable" | "disable",
): void => {
  //disable Inventory Stencil for inter-service relation instance
  const elements = [
    {
      selector: `.body_${stencilName}`,
      className: "stencil_accent-disabled",
    },
    {
      selector: `.bodyTwo_${stencilName}`,
      className: "stencil_body-disabled",
    },
    {
      selector: `.text_${stencilName}`,
      className: "stencil_text-disabled",
    },
  ];

  elements.forEach(({ selector, className }) => {
    const element = document.querySelector(selector);

    if (element) {
      element.classList.toggle(className, action === "disable");
    }
  });
};
