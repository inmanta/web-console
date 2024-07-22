import { dia } from "@inmanta/rappid";
import { EmbeddedEntity, ServiceModel } from "@/Core";
import { appendColumns } from "../actions";
import { ServiceEntityBlock } from "../shapes";

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
      true,
      service.name,
    );
    const nestedStencilElements =
      transformEmbeddedToStencilElements(embedded_entity);
    return [stencilElement, ...nestedStencilElements];
  });
};

export const createStencilElement = (
  name: string,
  entityModel: EmbeddedEntity | undefined = undefined,
  isEmbedded: boolean = false,
  holderName: string | undefined = undefined,
) => {
  return {
    type: "standard.Path",
    size: { width: 240, height: 40 },
    name: name,
    entity_model: entityModel,
    holderName,
    disabled: false,
    attrs: {
      body: {
        width: 7,
        height: 40,
        x: 233,
        fill: isEmbedded ? "#06c" : "#6753AC",
        stroke: "none",
      },
      bodyTwo: {
        width: 240,
        height: 40,
        fill: "#fff",
        stroke: "none",
      },
      label: {
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

export const createStencilDraggableShape = (
  cell: dia.Cell,
  isEmbedded: boolean,
) => {
  const entityModel = cell.get("entity_model") as ServiceModel | EmbeddedEntity;
  const instanceAsTable = new ServiceEntityBlock().setName(cell.get("name"));

  if (isEmbedded) {
    instanceAsTable.setTabColor("embedded");

    instanceAsTable.set("isEmbedded", true);
    instanceAsTable.set("holderName", cell.get("holderName"));
  }

  if (
    entityModel.inter_service_relations &&
    entityModel.inter_service_relations.length > 0
  ) {
    instanceAsTable.set("relatedTo", new Map());
  }
  if (entityModel.key_attributes) {
    appendColumns(instanceAsTable, entityModel.key_attributes, {}, true, true);
  }

  return instanceAsTable;
};
