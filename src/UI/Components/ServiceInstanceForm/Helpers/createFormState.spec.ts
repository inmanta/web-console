import { InstanceAttributeModel } from "@/Core";
import { Field, ServiceInstance } from "@/Test";
import {
  createDuplicateFormState,
  createEditFormState,
  createFormState,
} from "./createFormState";

test("GIVEN createFormState WHEN passed a number field with default value equals empty string THEN creates formState correctly", () => {
  const fields = [Field.dictList([Field.number])];
  const formState = createFormState(fields);

  expect(formState).toMatchObject({
    [Field.dictList().name]: [
      {
        [Field.number.name]: null,
      },
    ],
  });
});

test("GIVEN createFormState WHEN passed a number field with default value equals empty string THEN creates formState correctly", () => {
  const fields = [Field.dictList([Field.number])];
  const formState = createEditFormState(fields, "v1", {
    [Field.dictList().name]: [
      {
        [Field.number.name]: "",
      },
    ],
  });

  expect(formState).toMatchObject({
    [Field.dictList().name]: [
      {
        [Field.number.name]: null,
      },
    ],
  });
});

test("GIVEN createFormState WHEN passed a number field with default value equals empty string THEN creates formState correctly", () => {
  const fields = [Field.dictList([Field.number])];
  const formState = createDuplicateFormState(fields, {
    [Field.dictList().name]: [
      {
        [Field.number.name]: "",
      },
    ],
  });

  expect(formState).toMatchObject({
    [Field.dictList().name]: [
      {
        [Field.number.name]: null,
      },
    ],
  });
});

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
    [Field.dictionary.name]: {},
  });
});

test("Given creteFormState WHEN passed nested fields state THEN creates formState correctly", () => {
  const formState = createFormState(Field.nestedEditable);

  expect(formState).toMatchObject({
    id_attr: "id",
    other_attr1: "test",
    int_attr: 1,
    int_attr2: null,
    other_attr2: null,
    embedded: [],
    another_embedded: [],
  });
});

test("Given createEditFormState v1 WHEN passed editable nested fields and current state THEN creates formState correctly", () => {
  const formState = createEditFormState(
    Field.nestedEditable,
    "v1",
    ServiceInstance.nestedEditable.candidate_attributes,
  );

  expect(formState).toMatchObject({
    id_attr: "val",
    other_attr1: "test",
    int_attr: 10,
    int_attr2: 12,
    other_attr2: { a: "b" },
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
        dict_attr: {},
      },
    ],
  });
});

test("GIVEN fieldsToFormState WHEN passed a interservice relations THEN creates formState correctly", () => {
  const fields = Field.RelationListFields;
  const formState = createFormState(fields);

  expect(formState).toMatchObject({
    relation1: [],
    relation2: [],
    relation3: [],
    relation4: [],
    relation5: [],
    relation6: [],
  });
});

test("GIVEN createEditFormState v1 WHEN passed a interservice relations and current state THEN creates formState correctly", () => {
  const fields = Field.RelationListFields;
  const formState = createEditFormState(fields, "v1", {
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
    relation5: [],
    relation6: ["abc"],
  });
});

test("Given createEditFormState v2 WHEN passed editable nested fields and current state THEN returns unchanged passed state", () => {
  const formState = createEditFormState(
    Field.nestedEditable,
    "v2",
    ServiceInstance.nestedEditable.candidate_attributes,
  );

  expect(formState).toMatchObject(
    ServiceInstance.nestedEditable
      .candidate_attributes as InstanceAttributeModel,
  );
});
