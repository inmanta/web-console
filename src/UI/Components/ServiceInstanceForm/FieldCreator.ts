import { times } from "lodash";
import {
  AttributeModel,
  EmbeddedEntity,
  InstanceAttributeModel,
  isNotNull,
  ServiceModel,
  Field,
} from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";

export class FieldCreator {
  create(
    service: Pick<ServiceModel, "attributes" | "embedded_entities">
  ): Field[] {
    const fieldsFromAttributes: Field[] = attributesToFields(
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

    const fieldsFromAttributes: Field[] = attributesToFields(entity.attributes);

    const fieldsFromEmbeddedEntities = entity.embedded_entities
      .map((entity) => this.embeddedEntityToField(entity))
      .filter(isNotNull);

    if (this.isList(entity))
      return {
        kind: "DictList",
        name: entity.name,
        description: entity.description,
        isOptional: this.isOptional(entity),
        fields: [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities],
        min: entity.lower_limit,
        max: entity.upper_limit,
      };

    return {
      kind: "Nested",
      name: entity.name,
      description: entity.description,
      isOptional: this.isOptional(entity),
      fields: [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities],
    };
  }
}

export function fieldsToFormState(fields: Field[]): InstanceAttributeModel {
  return fields.reduce((acc, curr) => {
    switch (curr.kind) {
      case "Flat": {
        acc[curr.name] = curr.defaultValue;
        return acc;
      }

      case "Nested": {
        acc[curr.name] = fieldsToFormState(curr.fields);
        return acc;
      }

      case "DictList": {
        if (curr.min <= 0) {
          acc[curr.name] = [];
        } else {
          acc[curr.name] = times(curr.min, () =>
            fieldsToFormState(curr.fields)
          );
        }

        return acc;
      }
    }
  }, {});
}

function attributesToFields(attributes: AttributeModel[]): Field[] {
  const converter = new AttributeInputConverterImpl();
  return attributes
    .filter((attribute) => attribute.modifier !== "r")
    .map((attribute) => {
      const type = converter.getInputType(attribute);
      const defaultValue = converter.getFormDefaultValue(
        type,
        attribute.default_value_set,
        attribute.default_value
      );

      return {
        kind: "Flat",
        name: attribute.name,
        defaultValue: defaultValue,
        inputType: type,
        description: attribute.description,
        type: attribute.type,
        isOptional: attribute.type.includes("?"),
      };
    });
}
