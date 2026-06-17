import { JsonFormatter } from "@/Data";
import { VALUE_PREVIEW_LENGTH, classifyValue, getValuePreview } from "./helpers";

describe("classifyValue", () => {
  test.each`
    value                        | expectedKind
    ${'{"a": 1}'}                | ${"Json"}
    ${"[1, 2, 3]"}               | ${"Json"}
    ${"<note><to>x</to></note>"} | ${"Xml"}
    ${"just plain text"}         | ${"SingleLine"}
    ${"42"}                      | ${"SingleLine"}
  `("classifies $value as $expectedKind", ({ value, expectedKind }) => {
    expect(classifyValue(value).kind).toBe(expectedKind);
  });

  test("classifies long or multiline non-structured values as generic code", () => {
    expect(classifyValue("a".repeat(81)).kind).toBe("Code");
    expect(classifyValue("line one\nline two").kind).toBe("Code");
  });

  test("pretty-prints structured values via the shared classifier", () => {
    const raw = '{"b":2,"a":1}';

    expect(classifyValue(raw)).toMatchObject({
      kind: "Json",
      value: new JsonFormatter().format(JSON.parse(raw)),
    });
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
