import { PrimaryRouteManager } from "@/UI";
import { PageStateSanitizer } from "./PageStateSanitizer";

const sanitizer = new PageStateSanitizer(PrimaryRouteManager(""));

test("GIVEN sanitizer.isSanitized WHEN clean pageState THEN returns true", () => {
  const pageState = { Catalog: { x: "abc" } };
  expect(sanitizer.isSanitized("Catalog", pageState)).toBeTruthy();
});

test("GIVEN sanitizer.isSanitized WHEN dirty pageState THEN returns false", () => {
  const pageState = { Catalog: { x: "abc" }, dirty: "value" };
  expect(sanitizer.isSanitized("Catalog", pageState)).toBeFalsy();
});

test("GIVEN sanitizer.sanitize WHEN clean pageState THEN returns same pageState", () => {
  const pageState = { Catalog: { x: "abc" } };
  expect(sanitizer.sanitize("Catalog", pageState)).toEqual(pageState);
});

test("GIVEN sanitizer.sanitize WHEN dirty pageState THEN returns sanitized pageState", () => {
  const pageState = {
    Catalog: { x: "abc" },
    Inventory: { x: "abc" },
    dirty: "value",
  };
  expect(sanitizer.sanitize("Catalog", pageState)).toEqual({
    Catalog: { x: "abc" },
  });
});
