import { responsePartialOrder } from "../Data/Mock";
import { OrderDetailsTablePresenter } from "./OrderDetailsTablePresenter";

const presenter = new OrderDetailsTablePresenter();

const rows = presenter.createRows(responsePartialOrder.service_order_items);

test("Rows should have two items", () => {
  expect(rows).toHaveLength(2);
});

test("TablePresenter converts column index to name correctly", () => {
  expect(presenter.getColumnNameForIndex(0)).toEqual("instance_id");
  expect(presenter.getColumnNameForIndex(1)).toEqual("service_entity");
  expect(presenter.getColumnNameForIndex(-1)).toBeUndefined();
  expect(presenter.getColumnNameForIndex(10)).toBeUndefined();
});

test("TablePresenter converts column name to index correctly", () => {
  expect(presenter.getIndexForColumnName("instance_id")).toEqual(0);
  expect(presenter.getIndexForColumnName("service_entity")).toEqual(1);
  expect(presenter.getIndexForColumnName(undefined)).toEqual(-1);
});

test("TablePresenter returns sortable columns correctly", () => {
  expect(presenter.getSortableColumnNames()).toEqual([]);
});
