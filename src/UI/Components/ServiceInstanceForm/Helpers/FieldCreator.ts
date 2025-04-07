import {
  AttributeModel,
  EmbeddedEntity,
  isNotNull,
  ServiceModel,
  Field,
  InterServiceRelation,
  RelationAttribute,
} from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { ModifierHandler } from "./ModifierHandler";

/**
 * Create form fields based on a ServiceModel.
 * And more specifically, based on the AttributeModel and EmbeddedEntities.
 * @class
 * @param {ModifierHandler} ModifierHandler
 */
export class FieldCreator {
  constructor (
    private readonly fieldModifierHandler: ModifierHandler,
    private fieldsForEditForm: boolean = false,
  ) {}

  /**
   * Create the Array containing all information to construct a form
   *
   * @param service Pick<ServiceModel, "attributes" | "embedded_entities" | "inter_service_relations">
   * @returns {Array<Field>} An array of objects containing `fieldsFromAttributes` + `fieldsFromEmbeddedEntities` + `fieldsFromRelations`
   * These can be mapped to the result coming from the API to generate the form.
   */
  create (
    service: Pick<
      ServiceModel,
      "attributes" | "embedded_entities" | "inter_service_relations"
    >,
  ): Field[] {
    const fieldsFromAttributes: Field[] = this.attributesToFields(
      service.attributes,
    );

    if (
      service.embedded_entities.length <= 0 &&
      (!service.inter_service_relations ||
        service.inter_service_relations.length <= 0)
    ) {
      return fieldsFromAttributes;
    }

    const fieldsFromEmbeddedEntities = service.embedded_entities
      .map((entity) => this.embeddedEntityToField(entity))
      .filter(isNotNull);

    if (
      !service.inter_service_relations ||
      service.inter_service_relations.length <= 0
    ) {
      return [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities];
    }

    const fieldsFromRelations = service.inter_service_relations
      .map((interServiceRelation) =>
        this.interServiceRelationToFields(interServiceRelation),
      )
      .filter(isNotNull);

    return [
      ...fieldsFromAttributes,
      ...fieldsFromEmbeddedEntities,
      ...fieldsFromRelations,
    ];
  }

  private isOptional (entity: Pick<RelationAttribute, "lower_limit">): boolean {
    return entity.lower_limit === 0;
  }

  private isList (entity: Pick<RelationAttribute, "upper_limit">): boolean {
    return !entity.upper_limit || entity.upper_limit > 1;
  }

  /**
   * An embeddedEntity is a nested Entity of any of the Field types.
   * Visually, it will mostly be represented as a collapsible or a multiselect in some cases.
   *
   * @return This will return you an Entity with a nested fields Array which can contain again new Entities.
   */
  private embeddedEntityToField (entity: EmbeddedEntity): Field | null {
    if (!this.fieldModifierHandler.validateModifier(entity.modifier, true)) {
      return null;
    }

    const fieldsFromAttributes: Field[] = this.attributesToFields(
      entity.attributes,
      true,
    );

    const fieldsFromEmbeddedEntities = entity.embedded_entities
      .map((entity) => this.embeddedEntityToField(entity))
      .filter(isNotNull);

    const fieldsFromRelations = entity.inter_service_relations
      ? entity.inter_service_relations
        .map((interServiceRelation) =>
          this.interServiceRelationToFields(interServiceRelation, true),
        )
        .filter(isNotNull)
      : [];

    if (this.isList(entity))
      return {
        kind: "DictList",
        name: entity.name,
        description: entity.description,
        isOptional: this.isOptional(entity),
        fields: [
          ...fieldsFromAttributes,
          ...fieldsFromEmbeddedEntities,
          ...fieldsFromRelations,
        ],
        min: entity.lower_limit,
        max: entity.upper_limit,
        isDisabled: this.shouldFieldBeDisabled(entity),
      };

    return {
      kind: "Nested",
      name: entity.name,
      description: entity.description,
      isOptional: this.isOptional(entity),
      fields: [
        ...fieldsFromAttributes,
        ...fieldsFromEmbeddedEntities,
        ...fieldsFromRelations,
      ],
      isDisabled: this.shouldFieldBeDisabled(entity),
    };
  }

  private interServiceRelationToFields (
    interServiceRelation: InterServiceRelation,
    embedded?: boolean,
  ): Field | null {
    if (
      !this.fieldModifierHandler.validateModifier(
        interServiceRelation.modifier,
        embedded,
      )
    ) {
      return null;
    }

    if (interServiceRelation.upper_limit === 1)
      return {
        kind: "InterServiceRelation",
        name: interServiceRelation.name,
        description: interServiceRelation.description,
        isOptional: this.isOptional(interServiceRelation),
        isDisabled: this.shouldFieldBeDisabled(interServiceRelation),
        serviceEntity: interServiceRelation.entity_type,
      };

    return {
      kind: "RelationList",
      name: interServiceRelation.name,
      description: interServiceRelation.description,
      isOptional: this.isOptional(interServiceRelation),
      isDisabled: this.shouldFieldBeDisabled(interServiceRelation),
      serviceEntity: interServiceRelation.entity_type,
      min: interServiceRelation.lower_limit,
      max: interServiceRelation.upper_limit,
    };
  }

  attributesToFields (
    attributes: AttributeModel[],
    embedded?: boolean,
  ): Field[] {
    const converter = new AttributeInputConverterImpl();

    return attributes
      .filter((attribute) =>
        this.fieldModifierHandler.validateModifier(
          attribute.modifier,
          embedded,
        ),
      )
      .map((attribute) => {
        const type = converter.getInputType(attribute);
        const defaultValue = converter.getFormDefaultValue(
          type,
          attribute.default_value_set,
          attribute.default_value,
        );

        if (type === "bool") {
          return {
            kind: "Boolean",
            name: attribute.name,
            defaultValue: defaultValue,
            description: attribute.description,
            type: attribute.type,
            isOptional: attribute.type.includes("?"),
            isDisabled: this.shouldFieldBeDisabled(attribute),
          };
        }

        if (
          attribute.validation_type === "enum" ||
          attribute.validation_type === "enum?"
        ) {
          return {
            kind: "Enum",
            name: attribute.name,
            defaultValue: defaultValue,
            description: attribute.description,
            type: attribute.type,
            isOptional: attribute.type.includes("?"),
            options: attribute.validation_parameters.names,
            isDisabled: this.shouldFieldBeDisabled(attribute),
            suggestion:
              attribute.attribute_annotations?.web_suggested_values || null,
          };
        }

        if (attribute.type === "string[]" || attribute.type === "string[]?") {
          return {
            kind: "TextList",
            name: attribute.name,
            defaultValue: defaultValue,
            inputType: type,
            description: attribute.description,
            type: attribute.type,
            isOptional: this.isTextFieldOptional(attribute),
            isDisabled: this.shouldFieldBeDisabled(attribute),
            suggestion:
              attribute.attribute_annotations?.web_suggested_values || null,
          };
        }

        // WORKAROUND TO ADD SUPPORT FOR TEXTAREA
        if (
          (attribute.type === "string" || attribute.type === "string?") &&
          (attribute.validation_type === "pydantic.constr" ||
            attribute.validation_type === "pydantic.constr?") &&
          attribute.validation_parameters.max_length &&
          attribute.validation_parameters.max_length > 255
        ) {
          return {
            kind: "Textarea",
            name: attribute.name,
            defaultValue: defaultValue,
            inputType: type,
            description: attribute.description,
            type: attribute.type,
            isOptional: this.isTextFieldOptional(attribute),
            isDisabled: this.shouldFieldBeDisabled(attribute),
            suggestion:
              attribute.attribute_annotations?.web_suggested_values || null,
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
          isDisabled: this.shouldFieldBeDisabled(attribute),
          suggestion:
            attribute.attribute_annotations?.web_suggested_values || null,
        };
      });
  }

  private isTextFieldOptional (attribute: AttributeModel): boolean {
    return (
      attribute.type.includes("?") ||
      (attribute.default_value_set && attribute.default_value === "")
    );
  }
  private shouldFieldBeDisabled (
    object: AttributeModel | InterServiceRelation | EmbeddedEntity,
  ): boolean {
    return this.fieldsForEditForm && object.modifier !== "rw+";
  }
}
