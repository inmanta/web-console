import { NestedField } from "@/Core";
import { Service } from "@/Test";
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
    description: "desciption",
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
