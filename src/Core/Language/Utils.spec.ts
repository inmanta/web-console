import {
  toggleValueInList,
  invertFilter,
  removeInvertedSelection,
  stringifyList,
  getKeysExcluding,
  keepKeys,
  resolvePromiseRecord,
} from "./Utils";

test("toggleValueInList", () => {
  expect(toggleValueInList("a", ["a", "b"])).toEqual(["b"]);
});

test("toggleValueInList", () => {
  expect(toggleValueInList("a", ["b"])).toEqual(["b", "a"]);
});

test("invertFilter adds an exclamation mark when not present", () => {
  expect(invertFilter("deployed")).toEqual("!deployed");
});

test("invertFilter removes an exclamation mark when present", () => {
  expect(invertFilter("!failed")).toEqual("failed");
});

test("removeInvertedSelection removes the inverse selection if it exists", () => {
  const selected = ["deployed", "!failed"];

  expect(removeInvertedSelection("!deployed", selected)).toEqual(["!failed"]);
  expect(removeInvertedSelection("failed", selected)).toEqual(["deployed"]);
});

test("removeInvertedSelection returns the original list when no inverse is found", () => {
  const selected = ["deployed", "!failed"];

  expect(removeInvertedSelection("!skipped", selected)).toBe(selected);
});

test("stringifyList", () => {
  expect(stringifyList(["a", "b"])).toEqual("a, b");
});

test("stringifyList empty", () => {
  expect(stringifyList([])).toEqual("");
});

test("getKeysExcluding 0", () => {
  expect(getKeysExcluding(["a", "b"], { a: 1, b: 2 })).toHaveLength(0);
});

test("getKeysExcluding 1", () => {
  expect(getKeysExcluding(["a", "b"], { a: 1, b: 2, c: 3 })).toHaveLength(1);
});

test("keepKeys", () => {
  expect(keepKeys(["a", "b"], { a: 1, b: 2, c: 3 })).toEqual({ a: 1, b: 2 });
});

test("keepKeys", () => {
  expect(keepKeys(["a", "b"], { a: 1, c: 2, d: 3 })).toEqual({ a: 1 });
});

test("resolvePromiseRecord", async () => {
  const promiseRecord: Record<string, Promise<unknown>> = {
    a: new Promise((resolve) => resolve(123)),
    b: new Promise((resolve) => resolve("blabla")),
  };

  expect(await resolvePromiseRecord(promiseRecord)).toEqual({
    a: 123,
    b: "blabla",
  });
});
