import { isRowOfMultipleValues, TreeRow } from "./TreeRow";

test("TreeRow isRowOfMultipleValues returns fa;se for a single value", () => {
  const row: TreeRow = {
    kind: "Flat",
    id: "a",
    cell: { label: "name", value: "a" },
    cells: [
      { label: "candidate", value: "" },
      { label: "active", value: "b" },
      { label: "rollback", value: "" },
    ],
  };
  expect(isRowOfMultipleValues(row)).toBeFalsy();
});

test("TreeRow isRowOfMultipleValues returns true for multiple values", () => {
  const row: TreeRow = {
    kind: "Flat",
    id: "a",
    cell: { label: "name", value: "a" },
    cells: [
      { label: "candidate", value: "b" },
      { label: "active", value: "b" },
      { label: "rollback", value: "b" },
    ],
  };

  expect(isRowOfMultipleValues(row)).toBeTruthy();
});
