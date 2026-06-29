import { getAutoHeight, getDefaultHeightEditor } from "./helpers";

describe("getDefaultHeightEditor", () => {
  test.each`
    description           | code                                                              | expected
    ${"short JSON"}       | ${'{\n  "name": "test",\n  "value": 123\n}'}                      | ${"76px"}
    ${"long JSON"}        | ${"{\n" + Array(20).fill('  "key": "value",').join("\n") + "\n}"} | ${"300px"}
    ${"short XML"}        | ${"<root>\n  <element>value</element>\n</root>"}                  | ${"57px"}
    ${"single line text"} | ${"This is just a regular text value"}                            | ${"19px"}
  `("returns $expected for $description", ({ code, expected }) => {
    expect(getDefaultHeightEditor(code)).toBe(expected);
  });
});

describe("getAutoHeight", () => {
  const code = "line 1\nline 2";

  test("sizes to content when collapsed", () => {
    expect(getAutoHeight(code, false)).toBe(getDefaultHeightEditor(code));
  });

  test("fills the viewport when expanded", () => {
    expect(getAutoHeight(code, true)).toBe("calc(100vh - 300px)");
  });
});
