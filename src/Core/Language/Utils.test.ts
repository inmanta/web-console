import { toggleValueInList } from "./Utils";

test("toggleValueInList", () => {
  expect(toggleValueInList("a", ["a", "b"])).toEqual(["b"]);
});

test("toggleValueInList", () => {
  expect(toggleValueInList("a", ["b"])).toEqual(["b", "a"]);
});
