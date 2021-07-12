import { createFormState } from "./createFormState";
import { Field } from "@/Test";

test("GIVEN fieldsToFormState WHEN passed a DictListField THEN creates formState correctly", () => {
  const fields = [Field.dictList([Field.text])];
  const formState = createFormState(fields);
  expect(formState).toMatchObject({
    [Field.dictList().name]: [
      {
        [Field.text.name]: Field.text.defaultValue,
      },
    ],
  });
});
