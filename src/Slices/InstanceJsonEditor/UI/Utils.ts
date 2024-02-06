import { AttributeModel, EmbeddedEntity, ServiceModel } from "@/Core";

export const getSchema = (serviceEntity: ServiceModel) => {
  const attributes = serviceEntity.attributes;
  const embeddedEntities = serviceEntity.embedded_entities;
  // const relations = serviceEntity.inter_service_relations;

  const base = {
    type: "object",
    description: serviceEntity.description || "",
    properties: {},
  };

  attributes.forEach((item) => {
    base.properties[item.name] = convertAttributeToJSONSchema(item);
  });
  embeddedEntities.forEach((item) => {
    base.properties[item.name] = convertEmbeddedToJsonSchema(item);
  });

  return base;
};

const convertAttributeToJSONSchema = (item: AttributeModel) => {
  return {
    type: item.type,
    description: item.description || "",
    default: item.default_value,
  };
};

const convertEmbeddedToJsonSchema = (item: EmbeddedEntity) => {
  const base = {
    type: "Array",
    description: item.description || "",
    properties: {},
    required: item.key_attributes || [],
  };

  item.attributes.forEach((attribute) => {
    base.properties[attribute.name] = {
      type: attribute.type,
      desciption: attribute.description || "",
      default: attribute.default_value,
      ...(item.embedded_entities &&
        item.embedded_entities.map((embedded) =>
          convertEmbeddedToJsonSchema(embedded),
        )),
    };
  });

  if (item.embedded_entities && item.embedded_entities.length) {
    base.properties;
  }

  return base;
};
