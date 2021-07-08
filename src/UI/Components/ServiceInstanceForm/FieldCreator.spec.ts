import { NestedField } from "@/Core";
import { Service, Field } from "@/Test";
import { FieldCreator, fieldsToFormState } from "./FieldCreator";

test("GIVEN FieldCreator.create WHEN provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator().create(Service.a);
  expect(fields).toHaveLength(4);
  expect((fields[3] as NestedField).fields).toHaveLength(3);
});

test("GIVEN fieldsToFormState WHEN passed a DictListField THEN creates formState correctly", () => {
  const fields = [Field.dictList([Field.text])];
  const formState = fieldsToFormState(fields);
  expect(formState).toMatchObject({
    [Field.dictList().name]: [
      {
        [Field.text.name]: Field.text.defaultValue,
      },
    ],
  });
});
