import { Field } from "@/Test";
import { prepBody } from "./helper";

it("GIVEN prepBody THEN body is prepped correctly when not setting optional attributes", () => {
  const fields = [
    { ...Field.text, name: "string_attribute", isOptional: false },
    { ...Field.text, name: "opt_string_attribute" },
    { ...Field.bool, name: "bool_param" },
  ];
  const attributes = {
    string_attribute: "lorem ipsum",
    opt_string_attribute: "",
    bool_param: null,
  };

  const body = prepBody(fields, attributes);

  expect(body.attributes.string_attribute).toEqual("lorem ipsum");
  expect(body.attributes.opt_string_attribute).toBeUndefined();
  expect(body.attributes.bool_param).toBeUndefined();
});

it("GIVEN prepBody with initial_state THEN body includes initial_state", () => {
  const fields = [{ ...Field.text, name: "string_attribute", isOptional: false }];
  const attributes = {
    string_attribute: "lorem ipsum",
  };
  const initial_state = "custom_state";

  const body = prepBody(fields, attributes, initial_state);

  expect(body.attributes.string_attribute).toEqual("lorem ipsum");
  expect(body.initial_state).toEqual("custom_state");
});

it("GIVEN prepBody without initial_state THEN body does not include initial_state", () => {
  const fields = [{ ...Field.text, name: "string_attribute", isOptional: false }];
  const attributes = {
    string_attribute: "lorem ipsum",
  };

  const body = prepBody(fields, attributes);

  expect(body.attributes.string_attribute).toEqual("lorem ipsum");
  expect(body).not.toHaveProperty("initial_state");
});

it("GIVEN prepBody WHEN a numeric field holds a string value (e.g. a suggestion) THEN it is sanitized to a number", () => {
  const fields = [{ ...Field.number, name: "bandwidth", isOptional: false, type: "int" }];
  const body = prepBody(fields, { bandwidth: "10000" });

  expect(body.attributes.bandwidth).toBe(10000);
  expect(typeof body.attributes.bandwidth).toBe("number");
});
