import { getItemTitle } from "./getItemTitle";

test("GIVEN getItemTitle WHEN the item has a key value THEN it is the title", () => {
  expect(getItemTitle({ name: "ep-east" }, 0, ["name"])).toBe("ep-east");
});

test("GIVEN getItemTitle WHEN there are several keys THEN the filled ones are joined and empty ones skipped", () => {
  expect(getItemTitle({ a: "eth0", b: "", c: 1 }, 0, ["a", "b", "c"])).toBe("eth0 / 1");
});

test("GIVEN getItemTitle WHEN no key has a value or there are no keys THEN the position is the title", () => {
  expect(getItemTitle({ name: "" }, 1, ["name"])).toBe("#2");
  expect(getItemTitle({ name: "ep-east" }, 1, [])).toBe("#2");
});

test("GIVEN getItemTitle WHEN a key holds a dict or a list THEN it is not part of the title", () => {
  expect(getItemTitle({ a: { x: 1 }, b: ["x", "y"], c: true }, 2, ["a", "b", "c"])).toBe("true");
  expect(getItemTitle({ a: { x: 1 } }, 2, ["a"])).toBe("#3");
});
