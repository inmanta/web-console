import * as DiscoveredResources from "../Data/Mock";
import { DiscoveredResourcesTablePresenter } from "./DiscoveredResourcesTablePresenter";

const presenter = new DiscoveredResourcesTablePresenter();

const rows = presenter.createRows(DiscoveredResources.response.data);

test("Rows should have 17 items", () => {
  expect(rows).toHaveLength(17);
});

test("TablePresenter converts column index to name correctly", () => {
  expect(presenter.getColumnNameForIndex(0)).toEqual("type");
  expect(presenter.getColumnNameForIndex(1)).toEqual("agent");
  expect(presenter.getColumnNameForIndex(2)).toEqual("value");
  expect(presenter.getColumnNameForIndex(-1)).toBeUndefined();
  expect(presenter.getColumnNameForIndex(10)).toBeUndefined();
});

test("TablePresenter converts column name to index correctly", () => {
  expect(presenter.getIndexForColumnName("type")).toEqual(0);
  expect(presenter.getIndexForColumnName("agent")).toEqual(1);
  expect(presenter.getIndexForColumnName("value")).toEqual(2);
  expect(presenter.getIndexForColumnName(undefined)).toEqual(-1);
});

test("TablePresenter returns sortable columns correctly", () => {
  expect(presenter.getSortableColumnNames()).toEqual([]);
});
