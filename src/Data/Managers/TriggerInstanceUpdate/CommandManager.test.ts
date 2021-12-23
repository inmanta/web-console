import { Field } from "@/Test";
import { getBody } from "./CommandManager";

const currentAttributes = { attr1: "some value", attr2: "", attr3: null };

test("GIVEN getBody WHEN not setting optional attributes THEN generates correct body ", () => {
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

  const body = getBody(fields, currentAttributes, attributes);
  expect(body.attributes.attr1).toEqual("lorem ipsum");
  expect(body.attributes.attr2).toBeUndefined();
  expect(body.attributes.attr3).toBeUndefined();
});

test("GIVEN getBody WHEN changing optional attributes THEN generates correct body", () => {
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

  const body = getBody(fields, currentAttributes, attributes);
  expect(body.attributes.attr1).toEqual("lorem ipsum");
  expect(body.attributes.attr2).toBeNull();
  expect(body.attributes.attr3).toBeTruthy();
  expect(body.attributes.attr4).toEqual(42);
});
