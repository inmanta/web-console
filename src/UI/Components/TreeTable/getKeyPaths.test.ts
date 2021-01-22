import { dropLast, getKeyPaths, getKeyPathsWithValue } from "./getKeyPaths";

test("getKeyPaths returns empty list for boolean", () => {
  expect(getKeyPaths("", false)).toEqual([]);
});

test("getKeyPaths returns empty list for number", () => {
  expect(getKeyPaths("", 1234)).toEqual([]);
});

test("getKeyPaths returns empty list for string", () => {
  expect(getKeyPaths("", "blabla")).toEqual([]);
});

test("getKeyPaths returns empty list for null", () => {
  expect(getKeyPaths("", null)).toEqual([]);
});

test("getKeyPaths returns list for flat object", () => {
  const object = {
    a: false,
    b: 1234,
    c: "blabla",
    d: null,
    e: [],
    f: [1234, "blabla"],
  };
  expect(getKeyPaths("", object)).toEqual(["a", "b", "c", "d", "e", "f"]);
});

test("getKeyPaths returns list for nested object", () => {
  const object = {
    a: {
      b: "blabla",
      c: {
        d: {
          e: null,
          f: false,
          g: [],
        },
      },
    },
    b: 1234,
    c: {
      d: 1234,
    },
  };
  expect(getKeyPaths("", object)).toEqual([
    "a",
    "a.b",
    "a.c",
    "a.c.d",
    "a.c.d.e",
    "a.c.d.f",
    "a.c.d.g",
    "b",
    "c",
    "c.d",
  ]);
});

test("getKeyPathsWithValue returns dict for nested object", () => {
  const object = {
    a: {
      b: "blabla",
      c: {
        d: {
          e: null,
          f: false,
          g: [],
        },
      },
    },
    b: 1234,
    c: {
      d: 1234,
    },
  };
  expect(getKeyPathsWithValue(".", "", object)).toEqual({
    a: { done: false },
    "a.b": { done: true, value: "blabla" },
    "a.c": { done: false },
    "a.c.d": { done: false },
    "a.c.d.e": { done: true, value: null },
    "a.c.d.f": { done: true, value: false },
    "a.c.d.g": { done: true, value: [] },
    b: { done: true, value: 1234 },
    c: { done: false },
    "c.d": { done: true, value: 1234 },
  });
});

test("dropLast", () => {
  expect(dropLast("a.b.c", ".")).toMatch("a.b");
});
