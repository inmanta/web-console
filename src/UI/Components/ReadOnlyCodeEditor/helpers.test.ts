import { Language } from "@patternfly/react-code-editor";
import { getDefaultHeightEditor, isEditorKind, languageForKind } from "./helpers";

describe("languageForKind", () => {
  test.each`
    kind            | expected
    ${"Json"}       | ${Language.json}
    ${"Xml"}        | ${Language.xml}
    ${"Code"}       | ${undefined}
    ${"SingleLine"} | ${undefined}
  `("maps the $kind kind to $expected", ({ kind, expected }) => {
    expect(languageForKind(kind)).toBe(expected);
  });
});

describe("isEditorKind", () => {
  test.each`
    kind            | expected
    ${"Json"}       | ${true}
    ${"Xml"}        | ${true}
    ${"Code"}       | ${true}
    ${"SingleLine"} | ${false}
    ${"Password"}   | ${false}
    ${"File"}       | ${false}
    ${"Undefined"}  | ${false}
  `("returns $expected for the $kind kind", ({ kind, expected }) => {
    expect(isEditorKind(kind)).toBe(expected);
  });
});

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
