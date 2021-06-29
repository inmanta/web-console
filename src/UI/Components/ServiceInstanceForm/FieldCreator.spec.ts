import { FieldCreator } from "./FieldCreator";
import { Service } from "@/Test";
import { NestedField } from "./Field";

test("GIVEN FieldCreator.create WHEN provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator().create(Service.a);
  expect(fields).toHaveLength(4);
  expect((fields[3] as NestedField).fields).toHaveLength(3);
});
