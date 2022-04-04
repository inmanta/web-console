import {
  AttributeModel,
  EmbeddedEntity,
  isNotNull,
  ServiceModel,
  Field,
} from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { ModifierHandler } from "./ModifierHandler";

/**
 * Create form fields based on a ServiceModel.
 * And more specifically, based on the AttributeModel and EmbeddedEntities.
 */
export class FieldCreator {
  constructor(private readonly fieldModifierHandler: ModifierHandler) {}

  create(
    service: Pick<ServiceModel, "attributes" | "embedded_entities">
  ): Field[] {
    const fieldsFromAttributes: Field[] = this.attributesToFields(
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

  private isOptional(entity: Pick<EmbeddedEntity, "lower_limit">): boolean {
    return entity.lower_limit === 0;
  }

  private isList(entity: Pick<EmbeddedEntity, "upper_limit">): boolean {
    return !entity.upper_limit || entity.upper_limit > 1;
  }

  private embeddedEntityToField(entity: EmbeddedEntity): Field | null {
    if (!this.fieldModifierHandler.validateModifier(entity.modifier, true))
      return null;

    const fieldsFromAttributes: Field[] = this.attributesToFields(
      entity.attributes,
      true
    );

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

  private attributesToFields(
    attributes: AttributeModel[],
    embedded?: boolean
  ): Field[] {
    const converter = new AttributeInputConverterImpl();
    return attributes
      .filter((attribute) =>
        this.fieldModifierHandler.validateModifier(attribute.modifier, embedded)
      )
      .map((attribute) => {
        const type = converter.getInputType(attribute);
        const defaultValue = converter.getFormDefaultValue(
          type,
          attribute.default_value_set,
          attribute.default_value
        );
        if (type === "bool") {
          return {
            kind: "Boolean",
            name: attribute.name,
            defaultValue: defaultValue,
            description: attribute.description,
            type: attribute.type,
            isOptional: attribute.type.includes("?"),
          };
        }

        if (attribute.validation_type === "enum") {
          return {
            kind: "Enum",
            name: attribute.name,
            defaultValue: defaultValue,
            description: attribute.description,
            type: attribute.type,
            isOptional: attribute.type.includes("?"),
            options: attribute.validation_parameters.names,
          };
        }

        return {
          kind: "Text",
          name: attribute.name,
          defaultValue: defaultValue,
          inputType: type,
          description: attribute.description,
          type: attribute.type,
          isOptional: this.isTextFieldOptional(attribute),
        };
      });
  }
  private isTextFieldOptional(attribute: AttributeModel): boolean {
    return (
      attribute.type.includes("?") ||
      (attribute.default_value_set && attribute.default_value === "")
    );
  }
}
