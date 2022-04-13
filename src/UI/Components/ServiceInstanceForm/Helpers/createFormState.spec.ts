import { Field, ServiceInstance } from "@/Test";
import { createEditFormState, createFormState } from "./createFormState";

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

test("GIVEN createFormState WHEN passed a dict field with a default value THEN creates formState correctly", () => {
  const fields = [Field.dictionary];
  const formState = createFormState(fields);
  expect(formState).toEqual({
    [Field.dictionary.name]: "{}",
  });
});

test("Given fieldsToFormState WHEN passed editable nested fields and current state THEN creates formState correctly", () => {
  const formState = createEditFormState(
    Field.nestedEditable,
    ServiceInstance.nestedEditable.candidate_attributes
  );
  expect(formState).toMatchObject({
    id_attr: "val",
    other_attr1: "test",
    other_attr2: '{"a":"b"}',
    another_embedded: [
      {
        my_other_attr: "asdasd",
        another_embedded_single: {
          attr5: 3.14,
        },
      },
    ],
    embedded: [
      {
        embedded_single: {
          attr4: [2, 4],
        },
        my_attr: 0,
        bool_attr: null,
        dict_attr: '{"a":"b"}',
      },
    ],
  });
});

test("GIVEN fieldsToFormState WHEN passed a interservice relations THEN creates formState correctly", () => {
  const fields = Field.InterServiceRelationFields;
  const formState = createFormState(fields);
  expect(formState).toMatchObject({
    relation1: [],
    relation2: [],
    relation3: [],
    relation4: [],
    relation5: [""],
    relation6: [""],
  });
});

test("GIVEN fieldsToFormState WHEN passed a interservice relations and current state THEN creates formState correctly", () => {
  const fields = Field.InterServiceRelationFields;
  const formState = createEditFormState(fields, {
    relation1: ["id123", "id456"],
    relation2: [],
    relation4: ["id"],
    relation6: ["abc"],
  });
  expect(formState).toMatchObject({
    relation1: ["id123", "id456"],
    relation2: [],
    relation3: [],
    relation4: ["id"],
    relation5: [""],
    relation6: ["abc"],
  });
});
