import { EmbeddedEntity, isNotNull, ServiceModel } from "@/Core";
import { CreateFormPresenter } from "./Components/CreateFormPresenter";
import { AttributeInputConverterImpl } from "@/Data";
import { Field } from "./Field";

export class FieldCreator {
  presenter = new CreateFormPresenter(new AttributeInputConverterImpl());

  create(
    service: Pick<ServiceModel, "attributes" | "embedded_entities">
  ): Field[] {
    const fieldsFromAttributes: Field[] = this.presenter
      .convertToFormInputs(service.attributes)
      .map((value) => ({ kind: "Flat", ...value }));

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

    const fieldsFromAttributes: Field[] = this.presenter
      .convertToFormInputs(entity.attributes)
      .map((value) => ({ kind: "Flat", ...value }));

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
