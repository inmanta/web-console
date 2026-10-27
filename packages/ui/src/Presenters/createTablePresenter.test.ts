import { createTablePresenter } from "./createTablePresenter";

const columnHeads = [
  { displayName: "Name", apiName: "name" },
  { displayName: "Status", apiName: "status" },
];

const presenter = createTablePresenter<{ name: string }, { name: string }>({
  columnHeads,
  sortableColumns: ["name"],
  extraColumns: 2,
  createRows: (rows) => rows,
});

test("numberOfColumns adds the extra non-data columns to the column heads", () => {
  expect(presenter.getNumberOfColumns()).toBe(columnHeads.length + 2);
});

test("getColumnHeadDisplayNames returns the display names in order", () => {
  expect(presenter.getColumnHeadDisplayNames()).toEqual(
    columnHeads.map((head) => head.displayName)
  );
});

test("maps a column index to its api name, and anything out of range to undefined", () => {
  expect(presenter.getColumnNameForIndex(0)).toBe(columnHeads[0].apiName);
  expect(presenter.getColumnNameForIndex(columnHeads.length - 1)).toBe(
    columnHeads[columnHeads.length - 1].apiName
  );
  expect(presenter.getColumnNameForIndex(-1)).toBeUndefined();
  // The extra (action) columns sit past the data columns and have no api name.
  expect(presenter.getColumnNameForIndex(columnHeads.length)).toBeUndefined();
});

test("maps an api name to its column index, and unknown or missing names to -1", () => {
  expect(presenter.getIndexForColumnName(columnHeads[1].apiName)).toBe(1);
  expect(presenter.getIndexForColumnName("does_not_exist")).toBe(-1);
  expect(presenter.getIndexForColumnName(undefined)).toBe(-1);
});

test("getSortableColumnNames returns the configured sortable columns", () => {
  expect(presenter.getSortableColumnNames()).toEqual(["name"]);
});
