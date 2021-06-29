import {
  AttributeModel,
  EmbeddedEntity,
  isNotNull,
  ServiceModel,
} from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { Field } from "./Field";

export class FieldCreator {
  create(
    service: Pick<ServiceModel, "attributes" | "embedded_entities">
  ): Field[] {
    const fieldsFromAttributes: Field[] = attributestToFields(
      service.attributes
    );

    if (service.embedded_entities.length <= 0) {
      return fieldsFromAttributes;
    }

    const fieldsFromEmbeddedEntities = service.embedded_entities
      .map((entity) => this.embeddedEntityToField(entity))
      .filter(isNotNull);

    return [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities];
  }

  isOptional(entity: Pick<EmbeddedEntity, "lower_limit">): boolean {
    return entity.lower_limit === 0;
  }

  isList(entity: Pick<EmbeddedEntity, "upper_limit">): boolean {
    return entity.upper_limit > 1;
  }

  embeddedEntityToField(entity: EmbeddedEntity): Field | null {
    if (entity.modifier === "r") return null;

    const fieldsFromAttributes: Field[] = attributestToFields(
      entity.attributes
    );

    const fieldsFromEmbeddedEntities = entity.embedded_entities
      .map((entity) => this.embeddedEntityToField(entity))
      .filter(isNotNull);

    return {
      kind: this.isList(entity) ? "DictList" : "Nested",
      name: entity.name,
      description: entity.description,
      isOptional: this.isOptional(entity),
      fields: [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities],
    };
  }
}

function attributestToFields(attributes: AttributeModel[]): Field[] {
  const converter = new AttributeInputConverterImpl();
  return attributes.map((attributeModel) => {
    const type = converter.getInputType(attributeModel);
    const defaultValue = converter.getFormDefaultValue(
      type,
      attributeModel.default_value_set,
      attributeModel.default_value
    );
    return {
      kind: "Flat",
      name: attributeModel.name,
      defaultValue: defaultValue,
      inputType: type,
      description: attributeModel.description,
      type: attributeModel.type,
      isOptional: attributeModel.type.includes("?"),
    };
  });
}
