import { Language } from "@patternfly/react-code-editor";
import { JsonFormatter } from "@/Data";
import {
  VALUE_PREVIEW_LENGTH,
  detectLanguage,
  getFormattedValue,
  getValuePreview,
  isExpandableValue,
} from "./helpers";

describe("detectLanguage", () => {
  test.each`
    value                        | expected
    ${'{"a": 1}'}                | ${Language.json}
    ${"[1, 2, 3]"}               | ${Language.json}
    ${"<note><to>x</to></note>"} | ${Language.xml}
    ${"just plain text"}         | ${null}
    ${"42"}                      | ${null}
  `("classifies $value as $expected", ({ value, expected }) => {
    expect(detectLanguage(value)).toBe(expected);
  });

  test("classifies long or multiline non-structured values as generic code (undefined)", () => {
    expect(detectLanguage("a".repeat(81))).toBeUndefined();
    expect(detectLanguage("line one\nline two")).toBeUndefined();
  });
});

describe("getFormattedValue", () => {
  test("pretty-prints structured values via the shared classifier", () => {
    const raw = '{"b":2,"a":1}';

    expect(getFormattedValue(raw)).toBe(new JsonFormatter().format(JSON.parse(raw)));
  });

  test("returns plain values unchanged", () => {
    expect(getFormattedValue("plain text")).toBe("plain text");
  });
});

describe("isExpandableValue", () => {
  test("is true for structured and code values, false for short plain text", () => {
    expect(isExpandableValue('{"a": 1}')).toBe(true);
    expect(isExpandableValue("line one\nline two")).toBe(true);
    expect(isExpandableValue("plain text")).toBe(false);
  });
});

describe("getValuePreview", () => {
  test("returns the value unchanged when within the limit", () => {
    const short = "x".repeat(VALUE_PREVIEW_LENGTH);

    expect(getValuePreview(short)).toBe(short);
  });

  test("truncates and appends an ellipsis when over the limit", () => {
    const long = "x".repeat(VALUE_PREVIEW_LENGTH + 5);

    expect(getValuePreview(long)).toBe(`${long.slice(0, VALUE_PREVIEW_LENGTH)}…`);
  });
});
