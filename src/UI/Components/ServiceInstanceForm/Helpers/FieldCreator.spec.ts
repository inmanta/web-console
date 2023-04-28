import { AttributeModel, EmbeddedEntity, NestedField } from "@/Core";
import { Service } from "@/Test";
import {
  InterServiceRelationFields,
  RelationListFields,
} from "@/Test/Data/Field";
import { InterServiceRelations } from "@/Test/Data/Service";
import { FieldCreator } from "./FieldCreator";
import { CreateModifierHandler, EditModifierHandler } from "./ModifierHandler";

test("GIVEN FieldCreator for create form WHEN create is provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator(new CreateModifierHandler()).create(
    Service.a
  );
  expect(fields).toHaveLength(6);
  expect((fields[5] as NestedField).fields).toHaveLength(3);
});

test("GIVEN FieldCreator for edit form WHEN create is provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator(new EditModifierHandler()).create(
    Service.nestedEditable
  );

  expect(fields).toHaveLength(7);
  expect((fields[3] as NestedField).fields).toHaveLength(4);
  expect((fields[4] as NestedField).fields).toHaveLength(2);
  expect((fields[5] as NestedField).fields).toHaveLength(1);
});

test("GIVEN FieldCreator WHEN an attribute has the empty string as default value THEN the field is marked as optional", () => {
  const stringAttribute = {
    name: "attribute_with_empty_default_value",
    description: "description",
    modifier: "rw+",
    type: "string",
    default_value: "",
    default_value_set: true,
    validation_type: null,
    validation_parameters: null,
  };
  const attributes = [
    stringAttribute,
    {
      ...stringAttribute,
      name: "attribute_with_no_default_value",
      default_value: null,
      default_value_set: false,
    },
    {
      ...stringAttribute,
      name: "attribute_with_explicit_default_value",
      default_value: "default",
      default_value_set: true,
    },
    {
      ...stringAttribute,
      name: "attribute_with_null_default_value",
      default_value: null,
      default_value_set: true,
      type: "string?",
    },
  ];
  const fields = new FieldCreator(new CreateModifierHandler()).create({
    attributes: attributes,
    embedded_entities: [],
  });
  expect(fields).toHaveLength(attributes.length);
  expect(fields[0].isOptional).toBeTruthy();
  expect(fields[1].isOptional).toBeFalsy();
  expect(fields[2].isOptional).toBeFalsy();
  expect(fields[3].isOptional).toBeTruthy();
});
test("GIVEN FieldCreator WHEN an entity has validation_type 'enum' or 'enum?' THEN the field has kind ENUM", () => {
  const enumAttribute: AttributeModel = {
    name: "attribute_with_enum_validation",
    description: "description",
    modifier: "rw+",
    type: "string",
    default_value: null,
    default_value_set: true,
    validation_type: "enum",
    validation_parameters: {
      names: { OPTION_ONE: "OPTION_ONE", OPTION_TWO: "OPTION_TWO" },
      value: "value",
    },
  };
  const optionalEnumAttribute: AttributeModel = {
    name: "attribute_with_enum_validation",
    description: "description",
    modifier: "rw+",
    type: "string?",
    default_value: null,
    default_value_set: true,
    validation_type: "enum?",
    validation_parameters: {
      names: { OPTION_ONE: "OPTION_ONE", OPTION_TWO: "OPTION_TWO" },
      value: "validation_type",
    },
  };
  const fields = new FieldCreator(new CreateModifierHandler()).create({
    attributes: [enumAttribute, optionalEnumAttribute],
    embedded_entities: [],
  });
  expect(fields[0].isOptional).toBeFalsy();
  expect(fields[1].isOptional).toBeTruthy();
  expect(fields[0].kind).toMatch("Enum");
  expect(fields[1].kind).toMatch("Enum");
});

test("GIVEN FieldCreator WHEN an entity has inter service relations THEN they are classified correctly", () => {
  const embedded: EmbeddedEntity[] = [
    {
      attributes: [],
      inter_service_relations: InterServiceRelations.listWithAll,
      lower_limit: 0,
      modifier: "rw",
      name: "embedded_not_editable",
      embedded_entities: [],
    },
    {
      attributes: [],
      inter_service_relations: InterServiceRelations.listWithAll,
      lower_limit: 0,
      modifier: "rw+",
      name: "embedded_editable",
      embedded_entities: [],
    },
  ];
  const fields = new FieldCreator(new CreateModifierHandler()).create({
    attributes: [],
    embedded_entities: embedded,
    inter_service_relations: InterServiceRelations.listWithAll,
  });
  expect(fields).toHaveLength(
    embedded.length + InterServiceRelations.listWithAll.length
  );
  expect(fields).toEqual([
    {
      kind: "DictList",
      name: "embedded_not_editable",
      isOptional: true,
      fields: [...RelationListFields, ...InterServiceRelationFields],
      min: 0,
    },
    {
      kind: "DictList",
      name: "embedded_editable",
      isOptional: true,
      fields: [...RelationListFields, ...InterServiceRelationFields],
      min: 0,
    },
    ...RelationListFields,
    ...InterServiceRelationFields,
  ]);
});
