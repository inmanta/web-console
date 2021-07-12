import { NestedField } from "@/Core";
import { Service } from "@/Test";
import { FieldCreator } from "./FieldCreator";

test("GIVEN FieldCreator WHEN create is provided with a service THEN returns correct fields", () => {
  const fields = new FieldCreator().create(Service.a);
  expect(fields).toHaveLength(4);
  expect((fields[3] as NestedField).fields).toHaveLength(3);
});
