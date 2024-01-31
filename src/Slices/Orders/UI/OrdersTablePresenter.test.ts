import { orderResponse } from "../Data/Mock";
import { OrdersTablePresenter } from "./OrdersTablePresenter";

const presenter = new OrdersTablePresenter();

const rows = presenter.createRows(orderResponse.data);

test("Rows should have two items", () => {
  expect(rows).toHaveLength(4);
});

test("TablePresenter converts column index to name correctly", () => {
  expect(presenter.getColumnNameForIndex(0)).toEqual("created_at");
  expect(presenter.getColumnNameForIndex(1)).toEqual("completed_at");
  expect(presenter.getColumnNameForIndex(-1)).toBeUndefined();
  expect(presenter.getColumnNameForIndex(10)).toBeUndefined();
});

test("TablePresenter converts column name to index correctly", () => {
  expect(presenter.getIndexForColumnName("created_at")).toEqual(0);
  expect(presenter.getIndexForColumnName("completed_at")).toEqual(1);
  expect(presenter.getIndexForColumnName(undefined)).toEqual(-1);
});
test("TablePresenter returns sortable columns correctly", () => {
  expect(presenter.getSortableColumnNames()).toEqual(["created_at"]);
});
