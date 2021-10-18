import { toggleValueInList, stringifyList } from "./Utils";

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
