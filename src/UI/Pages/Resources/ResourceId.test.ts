import { ResourceId } from "./ResourceId";

test("Parse resource id with valid resource id", () => {
  const id = ResourceId.parse("std::File[internal,path=/tmp/dir1/file2]");
  expect(id).not.toBeNull();
  expect(id?.getEntityType()).toEqual("std::File");
  expect(id?.getAgentName()).toEqual("internal");
  expect(id?.getAttributeValue()).toEqual("/tmp/dir1/file2");
});

test("Parse resource id with valid resource version id", () => {
  const id = ResourceId.parse("std::File[internal,path=/tmp/dir1/file2],v=2");
  expect(id).not.toBeNull();
  expect(id?.getEntityType()).toEqual("std::File");
  expect(id?.getAgentName()).toEqual("internal");
  expect(id?.getAttributeValue()).toEqual("/tmp/dir1/file2");
});

test("Parse resource id with partial resource id", () => {
  const id = ResourceId.parse("std::File[internal,path]");
  expect(id).toBeNull();
});

test("Parse resource id with empty string", () => {
  const id = ResourceId.parse("");
  expect(id).toBeNull();
});
