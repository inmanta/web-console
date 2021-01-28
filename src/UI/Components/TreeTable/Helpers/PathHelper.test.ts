import { PathHelper } from "./PathHelper";

test("PathHelper isNested returns false for flat path", () => {
  expect(new PathHelper(".").isNested("a")).toBeFalsy();
});

test("PathHelper isNested returns true for single nested path", () => {
  expect(new PathHelper(".").isNested("a.b")).toBeTruthy();
});

test("PathHelper isNested returns true for deeply nested path", () => {
  expect(new PathHelper(".").isNested("a.b.b.c.b")).toBeTruthy();
});

test("PathHelper getParent returns path for flat path", () => {
  expect(new PathHelper(".").getParent("a")).toMatch("a");
});

test("PathHelper getParent returns parent for single nested path", () => {
  expect(new PathHelper(".").getParent("a.b")).toMatch("a");
});

test("PathHelper getParent returns parent for deeply nested path", () => {
  expect(new PathHelper(".").getParent("a.b.b.b.c.d")).toMatch("a.b.b.b.c");
});

test("PathHelper getSelf returns self for flat path", () => {
  expect(new PathHelper(".").getSelf("a")).toMatch("a");
});

test("PathHelper getSelf returns self for single nested path", () => {
  expect(new PathHelper(".").getSelf("a.b")).toMatch("b");
});

test("PathHelper getSelf returns self for deeply nested path", () => {
  expect(new PathHelper(".").getSelf("a.b.b.b.c.d")).toMatch("d");
});

test("PathHelper getLevel returns 0 for flat path", () => {
  expect(new PathHelper(".").getLevel("a")).toBe(0);
});

test("PathHelper getLevel returns 1 for single nested path", () => {
  expect(new PathHelper(".").getLevel("a.b")).toBe(1);
});

test("PathHelper getLevel returns 5 for deeply nested path", () => {
  expect(new PathHelper(".").getLevel("a.b.b.b.c.d")).toBe(5);
});
