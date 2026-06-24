import { Language } from "@patternfly/react-code-editor";
import { isEditorKind, languageForKind } from "./helpers";

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
