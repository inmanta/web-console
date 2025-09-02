import { shapes } from "@inmanta/rappid";
import {
  t_global_background_color_primary_default,
  t_global_border_color_200,
  t_global_font_size_body_default,
  t_global_text_color_regular,
} from "@patternfly/react-tokens";
import { v4 as uuidv4 } from "uuid";
import { EmbeddedEntity, InstanceAttributeModel, ServiceModel } from "@/Core";
import { HeaderColor, StencilState } from "../interfaces";

export interface CreateStencilElementParams {
  name: string;
  serviceModel: EmbeddedEntity | ServiceModel;
  instanceAttributes: InstanceAttributeModel;
  isEmbeddedEntity?: boolean;
  showBorderTop?: boolean;
  isDisabled?: boolean;
  holderName?: string;
}

/**
 * It recursively goes through embedded entities in the service model or embedded entity and creates stencil elements for each of them.
 * Stencil Elements are the visual representation of the entities in the Stencil Sidebar
 *
 * @param {ServiceModel | EmbeddedEntity} service - The service model or embedded entity whose embedded entities are to be transformed.
 *
 * @returns {shapes.standard.Path[]} An array of stencil elements created from the embedded entities
 */
export const transformEmbeddedToStencilElements = (
  service: ServiceModel | EmbeddedEntity
): shapes.standard.Path[] => {
  return service.embedded_entities
    .filter((embedded_entity) => embedded_entity.modifier !== "r") // filter out read-only embedded entities from the stencil as they can't be created by the user
    .flatMap((embedded_entity, index) => {
      const stencilElement = createStencilElement({
        name: embedded_entity.name,
        serviceModel: embedded_entity,
        instanceAttributes: {},
        isEmbeddedEntity: true,
        showBorderTop: index === 0,
        isDisabled: false,
        holderName: service.name,
      });
      const nestedStencilElements = transformEmbeddedToStencilElements(embedded_entity);

      return [stencilElement, ...nestedStencilElements];
    });
};

/**
 * Creates a stencil element with the given parameters.
 *
 * @param {CreateStencilElementParams} params - The parameters for creating the stencil element.
 * @param {string} params.name - The name of the stencil element.
 * @param {EmbeddedEntity | ServiceModel} params.serviceModel - The embedded entity model associated with the entity that the stencil element represents.
 * @param {InstanceAttributeModel} params.instanceAttributes - The instance attributes of the entity that the stencil element represents.
 * @param {boolean} params.isEmbeddedEntity - A boolean indicating whether the entity that the stencil represents is embedded or not. Defaults to false.
 * @param {boolean} params.showBorderTop - A boolean indicating whether to show a border on top. Defaults to false.
 * @param {boolean} params.isDisabled - A boolean indicating whether the element is disabled. Defaults to false.
 * @param {string} params.holderName - The name of the holder of the element that the stencil element represents. Optional.
 *
 * @returns {shapes.standard.Path} An object representing the stencil element.
 */
export const createStencilElement = ({
  name,
  serviceModel,
  instanceAttributes,
  isEmbeddedEntity = false,
  showBorderTop = false,
  isDisabled = false,
  holderName,
}: CreateStencilElementParams): shapes.standard.Path => {
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
    disabled: isDisabled,
    id,
    attrs: {
      body: {
        "aria-labelledby": "body_" + name,
        width: 7,
        height: 40,
        fill: isEmbeddedEntity ? HeaderColor.EMBEDDED : HeaderColor.RELATION,
        stroke: "none",
        className: isDisabled ? "stencil_accent-disabled" : "",
      },
      bodyTwo: {
        "aria-labelledby": "bodyTwo_" + name,
        width: 240,
        height: 40,
        x: 10,
        fill: t_global_background_color_primary_default.var,
        stroke: "none",
        className: isDisabled ? "stencil_body-disabled" : "",
      },
      label: {
        "aria-labelledby": "text_" + name,
        refX: undefined, // reset the default
        x: 15,
        textAnchor: "start",
        fontFamily: "sans-serif",
        fontSize: t_global_font_size_body_default.var,
        text: "type" in serviceModel && serviceModel.type ? serviceModel.type : name,
        fill: t_global_text_color_regular.var,
        className: isDisabled ? "stencil_text-disabled" : "",
      },
      borderBottom: {
        width: 233,
        height: 1,
        x: 0,
        y: 39,
        fill: t_global_border_color_200.var,
        stroke: "none",
      },
      borderTop: {
        width: 233,
        height: showBorderTop ? 1 : 0,
        x: 0,
        y: 0,
        fill: t_global_border_color_200.var,
        stroke: "none",
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
      {
        tagName: "rect",
        selector: "borderBottom",
      },
      {
        tagName: "rect",
        selector: "borderTop",
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
 * @param {boolean} isDisabled - if true, adds the disabled className . If false, removes disabled className
 *
 * @returns {void}
 */
export const toggleDisabledStencil = (stencilName: string, isDisabled?: boolean): void => {
  //disable Inventory Stencil for inter-service relation instance
  const elements = [
    {
      selector: `[aria-labelledby="body_${stencilName}"]`,
      className: "stencil_accent-disabled",
    },
    {
      selector: `[aria-labelledby="bodyTwo_${stencilName}"]`,
      className: "stencil_body-disabled",
    },
    {
      selector: `[aria-labelledby="text_${stencilName}"]`,
      className: "stencil_text-disabled",
    },
  ];

  elements.forEach(({ selector, className }) => {
    const element = document.querySelector(selector);

    if (element) {
      element.classList.toggle(className, isDisabled);
    }
  });
};

/**
 * Creates a stencil state for a given service model or embedded entity.
 *
 * @param serviceModel - The service model or embedded entity to create a stencil state for.
 * @param isInEditMode - A boolean indicating whether the stencil is in edit mode. Defaults to false.
 * @returns {StencilState} The created stencil state.
 */
export const createStencilState = (
  serviceModel: ServiceModel | EmbeddedEntity,
  isInEditMode = false
): StencilState => {
  let stencilState: StencilState = {};

  serviceModel.embedded_entities.forEach((entity) => {
    stencilState[entity.name] = {
      min: entity.lower_limit,
      max: entity.modifier === "rw" && isInEditMode ? 0 : entity.upper_limit,
      currentAmount: 0,
    };

    if (entity.embedded_entities) {
      stencilState = {
        ...stencilState,
        ...createStencilState(entity),
      };
    }
  });

  return stencilState;
};
