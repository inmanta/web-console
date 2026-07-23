import {
  AttributeModel,
  EmbeddedEntity,
  isNotNull,
  ServiceModel,
  Field,
  InterServiceRelation,
  RelationAttribute,
  UnitField,
} from "@/Core";
import { AttributeInputConverterImpl } from "@/Data";
import { resolveUnitConfig, UnitBounds } from "@/UI/Components/UnitInput";
import { ModifierHandler } from "./ModifierHandler";

const VALID_UNIT_SCALES = new Set(["metric", "iec", "both"]);

/**
 * Narrows the raw `web_unit_scales` annotation string to `resolveUnitConfig`'s expected union,
 * dropping anything else (a typo'd value is ignored — falls back to the default scales — rather
 * than degrading the whole field, since it's a narrower annotation-quality issue than a bad
 * `web_unit`).
 */
function parseUnitScales(value: string | undefined): "metric" | "iec" | "both" | undefined {
  return value && VALID_UNIT_SCALES.has(value) ? (value as "metric" | "iec" | "both") : undefined;
}

/**
 * Reads `ge`/`gt`/`le`/`lt` off an attribute's `validation_parameters`, regardless of
 * `validation_type` — the modeled `AttributeValidation` union only has bounds on
 * `pydantic.conint*`, but the backend can equally send `pydantic.confloat*` bounds for a `float`
 * attribute (not currently modeled anywhere in this union), and the parameter shape is identical.
 * `ParsedNumber` (`number | bigint`) values are narrowed to `number` — `UnitBounds` doesn't carry
 * bigint precision, which matches its current scope (bounds this large aren't a modeled concern
 * yet, only entered values are).
 */
function extractUnitBounds(attribute: AttributeModel): UnitBounds | undefined {
  const params = attribute.validation_parameters as
    | Record<string, number | bigint | undefined>
    | null
    | undefined;

  if (!params || typeof params !== "object") {
    return undefined;
  }

  const bounds: UnitBounds = {};

  (["ge", "gt", "le", "lt"] as const).forEach((key) => {
    const value = params[key];

    if (typeof value === "number" || typeof value === "bigint") {
      bounds[key] = Number(value);
    }
  });

  return Object.keys(bounds).length > 0 ? bounds : undefined;
}

/**
 * Create form fields based on a ServiceModel.
 * And more specifically, based on the AttributeModel and EmbeddedEntities.
 * @class
 * @param {ModifierHandler} ModifierHandler
 */
export class FieldCreator {
  constructor(
    private readonly fieldModifierHandler: ModifierHandler,
    private fieldsForEditForm: boolean = false
  ) {}

  /**
   * Create the Array containing all information to construct a form
   *
   * @param service Pick<ServiceModel, "attributes" | "embedded_entities" | "inter_service_relations">
   * @returns {Array<Field>} An array of objects containing `fieldsFromAttributes` + `fieldsFromEmbeddedEntities` + `fieldsFromRelations`
   * These can be mapped to the result coming from the API to generate the form.
   */
  create(
    service: Pick<ServiceModel, "attributes" | "embedded_entities" | "inter_service_relations">
  ): Field[] {
    const fieldsFromAttributes: Field[] = this.attributesToFields(service.attributes);

    if (
      service.embedded_entities.length <= 0 &&
      (!service.inter_service_relations || service.inter_service_relations.length <= 0)
    ) {
      return fieldsFromAttributes;
    }

    const fieldsFromEmbeddedEntities = service.embedded_entities
      .map((entity) => this.embeddedEntityToField(entity))
      .filter(isNotNull);

    if (!service.inter_service_relations || service.inter_service_relations.length <= 0) {
      return [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities];
    }

    const fieldsFromRelations = service.inter_service_relations
      .map((interServiceRelation) => this.interServiceRelationToFields(interServiceRelation))
      .filter(isNotNull);

    return [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities, ...fieldsFromRelations];
  }

  private isOptional(entity: Pick<RelationAttribute, "lower_limit">): boolean {
    return entity.lower_limit === 0;
  }

  private isList(entity: Pick<RelationAttribute, "upper_limit">): boolean {
    return !entity.upper_limit || entity.upper_limit > 1;
  }

  /**
   * An embeddedEntity is a nested Entity of any of the Field types.
   * Visually, it will mostly be represented as a collapsible or a multiselect in some cases.
   *
   * @return This will return you an Entity with a nested fields Array which can contain again new Entities.
   */
  private embeddedEntityToField(entity: EmbeddedEntity, embedded?: boolean): Field | null {
    if (!this.fieldModifierHandler.validateModifier(entity.modifier, true)) {
      return null;
    }

    // Tab assignment is only resolved for top-level fields; an assigned embedded
    // relation moves its whole sub-form onto the tab as one unit.
    const tab = embedded ? undefined : entity.attribute_annotations?.web_tab;

    const fieldsFromAttributes: Field[] = this.attributesToFields(entity.attributes, true);

    const fieldsFromEmbeddedEntities = entity.embedded_entities
      .map((entity) => this.embeddedEntityToField(entity, true))
      .filter(isNotNull);

    const fieldsFromRelations = entity.inter_service_relations
      ? entity.inter_service_relations
          .map((interServiceRelation) =>
            this.interServiceRelationToFields(interServiceRelation, true)
          )
          .filter(isNotNull)
      : [];

    if (this.isList(entity)) {
      return {
        kind: "DictList",
        name: entity.name,
        description: entity.description,
        isOptional: this.isOptional(entity),
        fields: [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities, ...fieldsFromRelations],
        min: entity.lower_limit,
        max: entity.upper_limit,
        isDisabled: this.shouldFieldBeDisabled(entity),
        tab,
      };
    }

    return {
      kind: "Nested",
      name: entity.name,
      description: entity.description,
      isOptional: this.isOptional(entity),
      fields: [...fieldsFromAttributes, ...fieldsFromEmbeddedEntities, ...fieldsFromRelations],
      isDisabled: this.shouldFieldBeDisabled(entity),
      tab,
    };
  }

  private interServiceRelationToFields(
    interServiceRelation: InterServiceRelation,
    embedded?: boolean
  ): Field | null {
    if (!this.fieldModifierHandler.validateModifier(interServiceRelation.modifier, embedded)) {
      return null;
    }

    const tab = embedded ? undefined : interServiceRelation.attribute_annotations?.web_tab;

    if (interServiceRelation.upper_limit === 1) {
      return {
        kind: "InterServiceRelation",
        name: interServiceRelation.name,
        description: interServiceRelation.description,
        isOptional: this.isOptional(interServiceRelation),
        isDisabled: this.shouldFieldBeDisabled(interServiceRelation),
        serviceEntity: interServiceRelation.entity_type,
        tab,
      };
    }

    return {
      kind: "RelationList",
      name: interServiceRelation.name,
      description: interServiceRelation.description,
      isOptional: this.isOptional(interServiceRelation),
      isDisabled: this.shouldFieldBeDisabled(interServiceRelation),
      serviceEntity: interServiceRelation.entity_type,
      min: interServiceRelation.lower_limit,
      max: interServiceRelation.upper_limit,
      tab,
    };
  }

  attributesToFields(attributes: AttributeModel[], embedded?: boolean): Field[] {
    const converter = new AttributeInputConverterImpl();

    return attributes
      .filter((attribute) =>
        this.fieldModifierHandler.validateModifier(attribute.modifier, embedded)
      )
      .map((attribute) => {
        const field = this.attributeToField(attribute, converter);

        // Tab assignment is only resolved for top-level fields.
        return embedded ? field : { ...field, tab: attribute.attribute_annotations?.web_tab };
      });
  }

  private attributeToField(
    attribute: AttributeModel,
    converter: AttributeInputConverterImpl
  ): Field {
    const type = converter.getInputType(attribute);
    const defaultValue = converter.getFormDefaultValue(
      type,
      attribute.default_value_set,
      attribute.default_value
    );

    const unitField = this.tryCreateUnitField(attribute, defaultValue);

    if (unitField) {
      return unitField;
    }

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

    if (type === "dict") {
      return {
        kind: "Dict",
        type: attribute.type,
        name: attribute.name,
        defaultValue: defaultValue,
        description: attribute.description,
        isOptional: this.isTextFieldOptional(attribute),
        isDisabled: this.shouldFieldBeDisabled(attribute),
      };
    }

    if (attribute.validation_type === "enum" || attribute.validation_type === "enum?") {
      return {
        kind: "Enum",
        name: attribute.name,
        defaultValue: defaultValue,
        description: attribute.description,
        type: attribute.type,
        isOptional: attribute.type.includes("?"),
        options: attribute.validation_parameters.names,
        isDisabled: this.shouldFieldBeDisabled(attribute),
        suggestion: attribute.attribute_annotations?.web_suggested_values || null,
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
        suggestion: attribute.attribute_annotations?.web_suggested_values || null,
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
        suggestion: attribute.attribute_annotations?.web_suggested_values || null,
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
      suggestion: attribute.attribute_annotations?.web_suggested_values || null,
    };
  }

  /**
   * `web_presentation: "unit"` opt-in (issue #7022). Returns `null` — never throws — for anything
   * that isn't opted in, or that fails to resolve (unrecognized `web_unit`, non-numeric type):
   * the caller falls through to the normal Text/Textarea/etc. branches, and a `console.warn` is
   * the only signal, per the spec's "the form never breaks on a bad annotation" contract.
   */
  private tryCreateUnitField(attribute: AttributeModel, defaultValue: unknown): UnitField | null {
    const annotations = attribute.attribute_annotations;

    if (annotations?.web_presentation !== "unit") {
      return null;
    }

    if (!annotations.web_unit) {
      console.warn(
        `Attribute "${attribute.name}" has web_presentation: "unit" but no web_unit annotation — falling back to a plain field.`
      );

      return null;
    }

    const result = resolveUnitConfig(
      {
        web_unit: annotations.web_unit,
        web_unit_scales: parseUnitScales(annotations.web_unit_scales),
        web_unit_display: annotations.web_unit_display,
      },
      attribute.type
    );

    if (!result.ok) {
      console.warn(`Attribute "${attribute.name}": ${result.reason} Falling back to a plain field.`);

      return null;
    }

    return {
      kind: "Unit",
      name: attribute.name,
      defaultValue,
      description: attribute.description,
      type: attribute.type,
      isOptional: this.isTextFieldOptional(attribute),
      isDisabled: this.shouldFieldBeDisabled(attribute),
      config: result.config,
      bounds: extractUnitBounds(attribute),
    };
  }

  private isTextFieldOptional(attribute: AttributeModel): boolean {
    return (
      attribute.type.includes("?") ||
      (attribute.default_value_set && attribute.default_value === "")
    );
  }
  private shouldFieldBeDisabled(
    object: AttributeModel | InterServiceRelation | EmbeddedEntity
  ): boolean {
    return this.fieldsForEditForm && object.modifier !== "rw+";
  }
}
