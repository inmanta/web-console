import { Field } from "@/Core";
import { TextInputTypes } from "@patternfly/react-core";
import { fieldsToFormState } from "@/UI/Components";
import { sanitizeAttributes } from "./sanitizeAttributes";

test("GIVEN sanitizeAttributes WHEN passed DictListFields THEN sanitices all fields", () => {
  const fields: Field[] = [
    {
      kind: "DictList",
      name: "dict-list",
      description: "description",
      isOptional: false,
      min: 1,
      max: 4,
      fields: [
        {
          kind: "Flat",
          name: "flat_field_text",
          description: "description",
          isOptional: true,
          defaultValue: "",
          inputType: TextInputTypes.text,
          type: "string?",
        },
        {
          kind: "Flat",
          name: "flat_field_boolean",
          isOptional: true,
          defaultValue: null,
          inputType: "bool",
          type: "bool?",
          description: "desc",
        },
      ],
    },
  ];

  const formState = fieldsToFormState(fields);
  const sanitized = sanitizeAttributes(fields, formState);
  expect(sanitized).toMatchObject({
    "dict-list": [
      {
        flat_field_text: undefined,
        flat_field_boolean: null,
      },
    ],
  });
});
