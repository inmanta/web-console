import { words } from "@inmanta/web-console-core";
import { getJSONEditorErrors } from "./helpers";

const marker = {
  message: 'Missing property "name".',
  startLineNumber: 2,
  startColumn: 3,
};

const markerError = words("validation.marker")(
  marker.message,
  marker.startLineNumber,
  marker.startColumn
);

describe("getJSONEditorErrors", () => {
  it("has no errors for JSON without markers", () => {
    expect(getJSONEditorErrors('{"name": "a"}', [])).toEqual([]);
  });

  it("has an error for each marker", () => {
    expect(getJSONEditorErrors("{}", [marker])).toEqual([markerError]);
  });

  it.each(["", "  ", '{"name": '])("has the invalid JSON error first for %j", (value) => {
    expect(getJSONEditorErrors(value, [marker])).toEqual([
      words("validation.invalidJson"),
      markerError,
    ]);
  });
});
