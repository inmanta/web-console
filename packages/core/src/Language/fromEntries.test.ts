import { fromEntries } from "./fromEntries";

test("fromEntries", () => {
  const entries = [
    [0, false],
    [1, true],
    [2, false],
  ];

  expect(fromEntries(entries)).toMatchObject({ 0: false, 1: true, 2: false });
});
