import {
  AttributeModel,
  DictListField,
  EmbeddedEntity,
  NestedField,
} from "@/Core";
import { Service } from "@/Test";
import {
  InterServiceRelationFields,
  RelationListFields,
} from "@/Test/Data/Field";
import { InterServiceRelations } from "@/Test/Data/Service";
import { attributesList } from "@/Test/Data/Service/Attribute";
import {
  editableEmbedded_base,
  editableOptionalEmbedded_base,
  embedded_base,
  optionalEmbedded_base,
} from "@/Test/Data/Service/EmbeddedEntity";
import { FieldCreator } from "./FieldCreator";
import { CreateModifierHandler, EditModifierHandler } from "./ModifierHandler";

test("GIVEN FieldCreator for create form WHEN create is provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator(new CreateModifierHandler()).create(
    Service.a,
  );
  expect(fields).toHaveLength(6);
  expect((fields[5] as NestedField).fields).toHaveLength(3);
});

test("GIVEN FieldCreator for edit form WHEN create is provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator(new EditModifierHandler()).create(
    Service.nestedEditable,
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
    embedded.length + InterServiceRelations.listWithAll.length,
  );
  expect(fields).toEqual([
    {
      kind: "DictList",
      name: "embedded_not_editable",
      isOptional: true,
      fields: [...RelationListFields, ...InterServiceRelationFields],
      min: 0,
      isDisabled: false,
    },
    {
      kind: "DictList",
      name: "embedded_editable",
      isOptional: true,
      fields: [...RelationListFields, ...InterServiceRelationFields],
      min: 0,
      isDisabled: false,
    },
    ...RelationListFields,
    ...InterServiceRelationFields,
  ]);
});
test("GIVEN FieldCreator WHEN attributes are processed for edit form THEN the field is marked as disabled correctly", () => {
  const fields = new FieldCreator(new CreateModifierHandler(), true).create({
    attributes: attributesList,
    embedded_entities: [],
  });
  expect(fields).toHaveLength(attributesList.length);
  expect(fields[0].isDisabled).toBeTruthy();
  expect(fields[1].isDisabled).toBeFalsy();
  expect(fields[2].isDisabled).toBeTruthy();
  expect(fields[3].isDisabled).toBeFalsy();
  expect(fields[4].isDisabled).toBeTruthy();
  expect(fields[5].isDisabled).toBeFalsy();
  expect(fields[6].isDisabled).toBeTruthy();
  expect(fields[7].isDisabled).toBeFalsy();
  expect(fields[8].isDisabled).toBeTruthy();
  expect(fields[9].isDisabled).toBeFalsy();
  expect(fields[10].isDisabled).toBeTruthy();
  expect(fields[11].isDisabled).toBeFalsy();
  expect(fields[12].isDisabled).toBeTruthy();
  expect(fields[13].isDisabled).toBeFalsy();
  expect(fields[14].isDisabled).toBeTruthy();
  expect(fields[15].isDisabled).toBeFalsy();
  expect(fields[16].isDisabled).toBeTruthy();
  expect(fields[17].isDisabled).toBeFalsy();
  expect(fields[18].isDisabled).toBeTruthy();
  expect(fields[19].isDisabled).toBeFalsy();
  expect(fields[20].isDisabled).toBeTruthy();
  expect(fields[21].isDisabled).toBeTruthy();
  expect(fields[22].isDisabled).toBeFalsy();
  expect(fields[23].isDisabled).toBeFalsy();

  expect(fields[0].kind).toBe("Text");
  expect(fields[1].kind).toBe("Text");
  expect(fields[2].kind).toBe("Text");
  expect(fields[3].kind).toBe("Text");
  expect(fields[4].kind).toBe("Boolean");
  expect(fields[5].kind).toBe("Boolean");
  expect(fields[6].kind).toBe("Boolean");
  expect(fields[7].kind).toBe("Boolean");
  expect(fields[8].kind).toBe("TextList");
  expect(fields[9].kind).toBe("TextList");
  expect(fields[10].kind).toBe("TextList");
  expect(fields[11].kind).toBe("TextList");
  expect(fields[12].kind).toBe("Enum");
  expect(fields[13].kind).toBe("Enum");
  expect(fields[14].kind).toBe("Enum");
  expect(fields[15].kind).toBe("Enum");
  expect(fields[16].kind).toBe("Text");
  expect(fields[17].kind).toBe("Text");
  expect(fields[18].kind).toBe("Text");
  expect(fields[19].kind).toBe("Text");
  expect(fields[20].kind).toBe("Textarea");
  expect(fields[21].kind).toBe("Textarea");
  expect(fields[22].kind).toBe("Textarea");
  expect(fields[23].kind).toBe("Textarea");
});

test.each`
  embeddedEntity
  ${embedded_base}
  ${optionalEmbedded_base}
`(
  "GIVEN FieldCreator WHEN embeddedEntities are processed for edit form THEN the field is marked as disabled correctly",
  async ({ embeddedEntity }) => {
    const fields = new FieldCreator(new CreateModifierHandler(), true).create({
      attributes: [],
      embedded_entities: [embeddedEntity],
    });
    const entityFields = fields[0] as DictListField;
    expect(fields[0].isDisabled).toBeTruthy();
    expect(entityFields.fields[0].isDisabled).toBeTruthy();
    expect(entityFields.fields[1].isDisabled).toBeFalsy();
    expect(entityFields.fields[2].isDisabled).toBeTruthy();
    expect(entityFields.fields[3].isDisabled).toBeFalsy();
    expect(entityFields.fields[4].isDisabled).toBeTruthy();
    expect(entityFields.fields[5].isDisabled).toBeFalsy();
    expect(entityFields.fields[6].isDisabled).toBeTruthy();
    expect(entityFields.fields[7].isDisabled).toBeFalsy();
    expect(entityFields.fields[8].isDisabled).toBeTruthy();
    expect(entityFields.fields[9].isDisabled).toBeFalsy();
    expect(entityFields.fields[10].isDisabled).toBeTruthy();
    expect(entityFields.fields[11].isDisabled).toBeFalsy();
    expect(entityFields.fields[12].isDisabled).toBeTruthy();
    expect(entityFields.fields[13].isDisabled).toBeFalsy();
    expect(entityFields.fields[14].isDisabled).toBeTruthy();
    expect(entityFields.fields[15].isDisabled).toBeFalsy();
    expect(entityFields.fields[16].isDisabled).toBeTruthy();
    expect(entityFields.fields[17].isDisabled).toBeFalsy();
    expect(entityFields.fields[18].isDisabled).toBeTruthy();
    expect(entityFields.fields[19].isDisabled).toBeFalsy();
    expect(entityFields.fields[20].isDisabled).toBeTruthy();
  },
);
test.each`
  embeddedEntity
  ${editableEmbedded_base}
  ${editableOptionalEmbedded_base}
`(
  "GIVEN FieldCreator WHEN editableEmbeddedEntities are processed for edit form THEN the field is marked as disabled correctly",
  async ({ embeddedEntity }) => {
    const fields = new FieldCreator(new CreateModifierHandler(), true).create({
      attributes: [],
      embedded_entities: [embeddedEntity],
    });

    const entityFields = fields[0] as DictListField;
    expect(fields[0].isDisabled).toBeFalsy();
    expect(entityFields.fields[0].isDisabled).toBeTruthy();
    expect(entityFields.fields[1].isDisabled).toBeFalsy();
    expect(entityFields.fields[2].isDisabled).toBeTruthy();
    expect(entityFields.fields[3].isDisabled).toBeFalsy();
    expect(entityFields.fields[4].isDisabled).toBeTruthy();
    expect(entityFields.fields[5].isDisabled).toBeFalsy();
    expect(entityFields.fields[6].isDisabled).toBeTruthy();
    expect(entityFields.fields[7].isDisabled).toBeFalsy();
    expect(entityFields.fields[8].isDisabled).toBeTruthy();
    expect(entityFields.fields[9].isDisabled).toBeFalsy();
    expect(entityFields.fields[10].isDisabled).toBeTruthy();
    expect(entityFields.fields[11].isDisabled).toBeFalsy();
    expect(entityFields.fields[12].isDisabled).toBeTruthy();
    expect(entityFields.fields[13].isDisabled).toBeFalsy();
    expect(entityFields.fields[14].isDisabled).toBeTruthy();
    expect(entityFields.fields[15].isDisabled).toBeFalsy();
    expect(entityFields.fields[16].isDisabled).toBeTruthy();
    expect(entityFields.fields[17].isDisabled).toBeFalsy();
    expect(entityFields.fields[18].isDisabled).toBeTruthy();
    expect(entityFields.fields[19].isDisabled).toBeFalsy();
    expect(entityFields.fields[20].isDisabled).toBeTruthy();
  },
);
