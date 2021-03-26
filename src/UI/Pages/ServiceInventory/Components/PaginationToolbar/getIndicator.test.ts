import { getIndicator } from "./getIndicator";

test("getIndicator returns '0 of 0' for no items", () => {
  expect(
    getIndicator({ before: 0, total: 0, page_size: 10, after: 0 })
  ).toMatch("0 of 0");
});

test("getIndicator returns '1 - 20 of 100' for page 1 of 100 items", () => {
  expect(
    getIndicator({ before: 0, total: 100, page_size: 20, after: 80 })
  ).toMatch("1 - 20 of 100");
});

test("getIndicator returns '21 - 40 of 100' for page 2 of 100 items", () => {
  expect(
    getIndicator({ before: 20, total: 100, page_size: 20, after: 60 })
  ).toMatch("21 - 40 of 100");
});

test("getIndicator returns '1 - 12 of 12' for page 1 of 12 items", () => {
  expect(
    getIndicator({ before: 0, total: 12, page_size: 20, after: 0 })
  ).toMatch("1 - 12 of 12");
});

test("getIndicator returns '1 - 20 of 22' for page 1 of 22 items", () => {
  expect(
    getIndicator({ before: 0, total: 22, page_size: 20, after: 2 })
  ).toMatch("1 - 20 of 22");
});

test("getIndicator returns '21 - 22 of 22' for page 2 of 22 items", () => {
  expect(
    getIndicator({ before: 20, total: 22, page_size: 20, after: 0 })
  ).toMatch("21 - 22 of 22");
});
