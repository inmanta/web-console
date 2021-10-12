import { NestedField } from "@/Core";
import { Service } from "@/Test";
import { FieldCreator } from "./FieldCreator";
import { CreateModifierHandler, EditModifierHandler } from "./ModifierHandler";

test("GIVEN FieldCreator for create form WHEN create is provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator(new CreateModifierHandler()).create(
    Service.a
  );
  expect(fields).toHaveLength(4);
  expect((fields[3] as NestedField).fields).toHaveLength(3);
});

test("GIVEN FieldCreator for edit form WHEN create is provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator(new EditModifierHandler()).create(
    Service.nestedEditable
  );

  expect(fields).toHaveLength(5);
  expect((fields[3] as NestedField).fields).toHaveLength(4);
  expect((fields[4] as NestedField).fields).toHaveLength(2);
});
