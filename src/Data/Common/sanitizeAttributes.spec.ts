import { createFormState } from "@/UI/Components";
import { sanitizeAttributes } from "./sanitizeAttributes";
import { Field } from "@/Test";

test("GIVEN sanitizeAttributes WHEN passed DictListFields THEN sanitizes all fields", () => {
  const fields = [Field.dictList([Field.text, Field.bool])];
  const formState = createFormState(fields);
  const sanitized = sanitizeAttributes(fields, formState);
  expect(sanitized).toMatchObject({
    dict_list_field: [
      {
        flat_field_text: null,
        flat_field_boolean: null,
      },
    ],
  });
});
