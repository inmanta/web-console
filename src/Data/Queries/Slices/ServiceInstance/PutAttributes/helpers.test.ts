import { Field } from "@/Test";
import { getBodyPut } from "./helpers";

test("GIVEN getBodyPut WHEN attributes contain numeric strings THEN sanitizes types correctly", () => {
  const fields = [
    { ...Field.text, name: "attr1", isOptional: false, type: "string" },
    { ...Field.text, name: "attr2", isOptional: true, type: "string?" },
    { ...Field.bool, name: "attr3", isOptional: true, type: "bool?" },
    { ...Field.number, name: "attr4", isOptional: true, type: "int?" },
  ];
  const attributes = {
    attr1: "some value",
    attr3: true,
    attr4: "42",
  };

  const body = getBodyPut(fields, attributes);

  expect(body.attributes.attr1).toEqual("some value");
  expect(body.attributes.attr3).toBe(true);
  expect(body.attributes.attr4).toEqual(42);
});

test("GIVEN getBodyPut WHEN all attributes provided THEN sends all attributes without diffing", () => {
  const fields = [
    { ...Field.text, name: "attr1", isOptional: false, type: "string" },
    { ...Field.text, name: "attr2", isOptional: false, type: "string" },
  ];
  const attributes = {
    attr1: "value1",
    attr2: "value2",
  };

  const body = getBodyPut(fields, attributes);

  expect(body.attributes.attr1).toEqual("value1");
  expect(body.attributes.attr2).toEqual("value2");
});

test("GIVEN getBodyPut THEN generates a unique put_id on each call", () => {
  const fields = [{ ...Field.text, name: "attr1", isOptional: false, type: "string" }];
  const attributes = { attr1: "value" };

  const body1 = getBodyPut(fields, attributes);
  const body2 = getBodyPut(fields, attributes);

  expect(typeof body1.put_id).toBe("string");
  expect(body1.put_id.length).toBeGreaterThan(0);
  expect(body1.put_id).not.toEqual(body2.put_id);
});
