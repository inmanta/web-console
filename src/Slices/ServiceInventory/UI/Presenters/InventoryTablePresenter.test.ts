import { Service, ServiceInstance } from "@/Test";
import { InventoryTablePresenter } from "./InventoryTablePresenter";

const tablePresenter = () => new InventoryTablePresenter();

const tablePresenterWithIdentity = () =>
  new InventoryTablePresenter("service_id", "Service ID");

const presenter = new InventoryTablePresenter();
const rows = presenter.createRows([ServiceInstance.a], Service.a);

test("TablePresenter short id", () => {
  expect(rows[0].id.short.length).toBe(4);
});

test("TablePresenter converts column index to name correctly", () => {
  expect(tablePresenter().getColumnNameForIndex(0)).toEqual("id");
  expect(tablePresenter().getColumnNameForIndex(1)).toEqual("state");
  expect(tablePresenter().getColumnNameForIndex(-1)).toBeUndefined();
  expect(tablePresenter().getColumnNameForIndex(10)).toBeUndefined();
});

test("TablePresenter converts column name to index correctly", () => {
  expect(tablePresenter().getIndexForColumnName("id")).toEqual(0);
  expect(tablePresenter().getIndexForColumnName("state")).toEqual(1);
  expect(tablePresenter().getIndexForColumnName("history")).toEqual(-1);
  expect(tablePresenter().getIndexForColumnName(undefined)).toEqual(-1);
});

test("TablePresenter returns sortable columns correctly", () => {
  expect(tablePresenter().getSortableColumnNames()).toEqual([
    "state",
    "created_at",
    "last_updated",
  ]);
});

describe("TablePresenter with identity ", () => {
  const presenterWithIdentity = tablePresenterWithIdentity();

  test("returns sortable columns correctly", () => {
    expect(presenterWithIdentity.getSortableColumnNames()).toEqual([
      "state",
      "created_at",
      "last_updated",
      "service_id",
    ]);
  });
  test("converts column index to name correctly", () => {
    expect(presenterWithIdentity.getColumnNameForIndex(0)).toEqual(
      "service_id",
    );
    expect(presenterWithIdentity.getColumnNameForIndex(1)).toEqual("state");
    expect(presenterWithIdentity.getColumnNameForIndex(-1)).toBeUndefined();
    expect(presenterWithIdentity.getColumnNameForIndex(10)).toBeUndefined();
  });

  test("converts column name to index correctly", () => {
    expect(presenterWithIdentity.getIndexForColumnName("id")).toEqual(-1);
    expect(presenterWithIdentity.getIndexForColumnName("service_id")).toEqual(
      0,
    );
    expect(presenterWithIdentity.getIndexForColumnName("state")).toEqual(1);
    expect(presenterWithIdentity.getIndexForColumnName("history")).toEqual(-1);
    expect(presenterWithIdentity.getIndexForColumnName(undefined)).toEqual(-1);
  });
});

describe("TablePresenter with Actions", () => {
  const presenterWithActions = new InventoryTablePresenter(
    "service_id",
    "Service ID",
  );

  test("TablePresenter converts column name to index correctly", () => {
    expect(presenterWithActions.getIndexForColumnName("id")).toEqual(-1);
    expect(presenterWithActions.getIndexForColumnName("state")).toEqual(1);
    expect(presenterWithActions.getIndexForColumnName("history")).toEqual(-1);
    expect(presenterWithActions.getIndexForColumnName(undefined)).toEqual(-1);
  });
});
