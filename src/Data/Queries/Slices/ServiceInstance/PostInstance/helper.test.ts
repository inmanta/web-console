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
