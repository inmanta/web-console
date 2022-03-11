import { Maybe } from "@/Core";
import { IdParser } from "./Resource";

test("Parse resource id with valid resource id", () => {
  const id = IdParser.parse("std::File[internal,path=/tmp/dir1/file2]");
  expect(Maybe.isSome(id)).toBeTruthy();
  if (Maybe.isSome(id)) {
    expect(id.value.entityType).toEqual("std::File");
    expect(id.value.agentName).toEqual("internal");
    expect(id.value.attributeValue).toEqual("/tmp/dir1/file2");
  }
});

test("Parse resource id with valid resource version id", () => {
  const id = IdParser.parse("std::File[internal,path=/tmp/dir1/file2],v=2");
  expect(Maybe.isSome(id)).toBeTruthy();
  if (Maybe.isSome(id)) {
    expect(id.value.entityType).toEqual("std::File");
    expect(id.value.agentName).toEqual("internal");
    expect(id.value.attributeValue).toEqual("/tmp/dir1/file2");
  }
});

test("Parse resource id with partial resource id", () => {
  const id = IdParser.parse("std::File[internal,path]");
  expect(Maybe.isNone(id)).toBeTruthy();
});

test("Parse resource id with empty string", () => {
  const id = IdParser.parse("");
  expect(Maybe.isNone(id)).toBeTruthy();
});
