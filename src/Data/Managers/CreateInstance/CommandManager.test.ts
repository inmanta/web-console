import { Field } from "@/Test";
import { prepBody } from "./CommandManager";

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
