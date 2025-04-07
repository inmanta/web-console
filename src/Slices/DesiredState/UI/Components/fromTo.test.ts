import { sanitizeFromTo } from "./fromTo";

test("GIVEN sanitizeFromTo THEN returns correct {from,to}", () => {
  expect(sanitizeFromTo(1, 2)).toEqual({ from: "1", to: "2" });
  expect(sanitizeFromTo(2, 1)).toEqual({ from: "1", to: "2" });
  expect(sanitizeFromTo(111, 3000)).toEqual({ from: "111", to: "3000" });
  expect(sanitizeFromTo(3000, 111)).toEqual({ from: "111", to: "3000" });
});
