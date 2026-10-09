import { IdParser } from "./Resource";

test("Parse resource id with valid resource id", () => {
  const id = IdParser.parse("std::File[internal,path=/tmp/dir1/file2]");

  expect(id).toEqual({
    entityType: "std::File",
    agentName: "internal",
    attribute: "path",
    attributeValue: "/tmp/dir1/file2",
  });
});

test("Parse resource id with valid resource version id", () => {
  const id = IdParser.parse("std::File[internal,path=/tmp/dir1/file2],v=2");

  expect(id).toEqual({
    entityType: "std::File",
    agentName: "internal",
    attribute: "path",
    attributeValue: "/tmp/dir1/file2",
  });
});

test("Parse resource id with partial resource id", () => {
  const id = IdParser.parse("std::File[internal,path]");

  expect(id).toBeUndefined();
});

test("Parse resource id with empty string", () => {
  const id = IdParser.parse("");

  expect(id).toBeUndefined();
});
