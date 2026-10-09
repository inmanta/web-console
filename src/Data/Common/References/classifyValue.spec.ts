import { classifyValue } from "./classifyValue";

describe("classifyValue", () => {
  test("classifies a plain value as single-line text", () => {
    expect(classifyValue("name", "NETBOX_API_TOKEN")).toEqual({
      kind: "SingleLine",
      key: "name",
      value: "NETBOX_API_TOKEN",
    });
  });

  test("keeps keys the default classifier drops, like version", () => {
    // the point of includeAllKeys: a default classifier ignores `version`
    expect(classifyValue("version", "v3")).toEqual({
      kind: "SingleLine",
      key: "version",
      value: "v3",
    });
  });

  test("masks a password-named argument", () => {
    expect(classifyValue("password", "hunter2")).toMatchObject({ kind: "Password", value: "****" });
  });
});
