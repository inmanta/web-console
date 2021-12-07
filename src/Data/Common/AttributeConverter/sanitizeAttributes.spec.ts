import { Field } from "@/Test";
import { createFormState } from "@/UI/Components";
import { sanitizeAttributes } from "./sanitizeAttributes";

test("GIVEN sanitizeAttributes WHEN passed DictListFields THEN sanitizes all fields", () => {
  const fields = [Field.dictList([Field.text, Field.bool])];
  const formState = createFormState(fields);
  const sanitized = sanitizeAttributes(fields, formState);
  expect(sanitized).toMatchObject({
    dict_list_field: [
      {
        text_field: null,
        boolean_field: null,
      },
    ],
  });
});
