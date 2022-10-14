import { PrimaryRouteManager } from "@/UI";
import { SearchSanitizer } from "./SearchSanitizer";

const sanitizer = new SearchSanitizer(PrimaryRouteManager(""));

test("GIVEN sanitizer.isSanitized WHEN clean string THEN returns true", () => {
  const search = "?state.Catalog.x=abc&env=123";
  expect(sanitizer.isSanitized("Catalog", search)).toBeTruthy();
});

test("GIVEN sanitizer.isSanitized WHEN dirty string THEN returns false", () => {
  const search = "?state.Inventory.x=abc&env=123&dirty=value";
  expect(sanitizer.isSanitized("Catalog", search)).toBeFalsy();
});

test("GIVEN sanitizer.sanitize WHEN clean string THEN returns same string", () => {
  const search = "?state.Catalog.x=abc&env=123";
  expect(sanitizer.sanitize("Catalog", search)).toMatch(search);
});

test("GIVEN sanitizer.sanitize WHEN no state THEN returns sanitized string", () => {
  const search = "?env=123&some=abc";
  expect(sanitizer.sanitize("Catalog", search)).toMatch("?env=123");
});

test("GIVEN sanitizer.sanitize WHEN invalid state THEN returns sanitized string", () => {
  const search = "?state=abc&env=123&some=abc";
  expect(sanitizer.sanitize("Catalog", search)).toMatch("?env=123");
});

test("GIVEN sanitizer.sanitize WHEN dirty string THEN returns sanitized string", () => {
  const search = "?state.Inventory.x=abc&env=123&some=abc";
  expect(sanitizer.sanitize("Catalog", search)).toMatch("?env=123");
});
