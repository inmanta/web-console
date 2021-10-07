import {
  toggleValueInList,
  stringifyList,
  getKeysExcluding,
  keepKeys,
} from "./Utils";

test("toggleValueInList", () => {
  expect(toggleValueInList("a", ["a", "b"])).toEqual(["b"]);
});

test("toggleValueInList", () => {
  expect(toggleValueInList("a", ["b"])).toEqual(["b", "a"]);
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
