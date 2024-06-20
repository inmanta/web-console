import * as DiscoveredResources from "../Data/Mock";
import { DiscoveredResourcesTablePresenter } from "./DiscoveredResourcesTablePresenter";

const presenter = new DiscoveredResourcesTablePresenter();

const rows = presenter.createRows(DiscoveredResources.response.data);

test("Rows should have two items", () => {
  expect(rows).toHaveLength(17);
});

test("TablePresenter converts column index to name correctly", () => {
  expect(presenter.getColumnNameForIndex(0)).toEqual("discovered_resource_id");
  expect(presenter.getColumnNameForIndex(1)).toEqual("managed_resource_id");
  expect(presenter.getColumnNameForIndex(-1)).toBeUndefined();
  expect(presenter.getColumnNameForIndex(10)).toBeUndefined();
});

test("TablePresenter converts column name to index correctly", () => {
  expect(presenter.getIndexForColumnName("discovered_resource_id")).toEqual(0);
  expect(presenter.getIndexForColumnName("managed_resource_id")).toEqual(1);
  expect(presenter.getIndexForColumnName(undefined)).toEqual(-1);
});

test("TablePresenter returns sortable columns correctly", () => {
  expect(presenter.getSortableColumnNames()).toEqual([
    "discovered_resource_id",
  ]);
});
