import { Field } from "@/Test";
import { getBodyV1, getBodyV2 } from "./CommandManager";

const currentAttributes = { attr1: "some value", attr2: "", attr3: null };

test("GIVEN getBodyV1 WHEN not setting optional attributes THEN generates correct body ", () => {
  const fields = [
    { ...Field.text, name: "attr1", isOptional: false, type: "string" },
    { ...Field.text, name: "attr2", isOptional: false, type: "string" },
    { ...Field.bool, name: "attr3", isOptional: true, type: "bool?" },
  ];
  const attributes = {
    attr1: "lorem ipsum",
    attr2: "",
    attr3: null,
  };

  const body = getBodyV1(fields, currentAttributes, attributes);
  expect(body.attributes.attr1).toEqual("lorem ipsum");
  expect(body.attributes.attr2).toBeUndefined();
  expect(body.attributes.attr3).toBeUndefined();
});

test("GIVEN getBodyV1 WHEN changing optional attributes THEN generates correct body", () => {
  const fields = [
    { ...Field.text, name: "attr1", isOptional: false, type: "string" },
    { ...Field.text, name: "attr2", isOptional: true, type: "string?" },
    { ...Field.bool, name: "attr3", isOptional: true, type: "bool?" },
    { ...Field.number, name: "attr4", isOptional: true, type: "int?" },
  ];
  const attributes = {
    attr1: "lorem ipsum",
    attr2: null,
    attr3: true,
    attr4: "42",
  };

  const body = getBodyV1(fields, currentAttributes, attributes);
  expect(body.attributes.attr1).toEqual("lorem ipsum");
  expect(body.attributes.attr2).toBeNull();
  expect(body.attributes.attr3).toBeTruthy();
  expect(body.attributes.attr4).toEqual(42);
});

//TODO make PATCH V2 ready
test("GIVEN getBodyV2 WHEN changing optional attributes THEN generates correct body", () => {
  const service_entity = "test-entity";
  const service_version = 4;

  const fields = [
    { ...Field.text, name: "attr1", isOptional: false, type: "string" },
    { ...Field.text, name: "attr2", isOptional: true, type: "string?" },
    { ...Field.bool, name: "attr3", isOptional: true, type: "bool?" },
    { ...Field.number, name: "attr4", isOptional: true, type: "int?" },
  ];

  //to simulate actual behavior after refactor attr1 was added as from now on all of the fields are passed to getBodyV2 function in the flow.
  const attributes = {
    attr1: "some value",
    attr2: null,
    attr3: true,
    attr4: "42",
  };

  const body = getBodyV2(fields, attributes, service_entity, service_version);
  expect(body.edit[0]).toEqual({
    edit_id: "test-entity_version=4",
    operation: "replace",
    target: ".",
    value: {
      attr1: "some value",
      attr2: null,
      attr3: true,
      attr4: 42,
    },
  });
});
