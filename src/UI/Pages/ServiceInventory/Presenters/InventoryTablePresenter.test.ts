import { InventoryTablePresenter } from "./InventoryTablePresenter";
import { AttributesPresenter } from "./AttributesPresenter";
import {
  instance,
  DummyActionPresenter,
  DummyDatePresenter,
  tablePresenter,
} from "@/Test";
import { DummyStatePresenter } from "@/Test/Mock/DummyStatePresenter";

const presenter = new InventoryTablePresenter(
  new DummyDatePresenter(),
  new AttributesPresenter(),
  new DummyActionPresenter(),
  new DummyStatePresenter()
);
const rows = presenter.createRows([instance]);

test("TablePresenter short id", () => {
  expect(rows[0].id.short.length).toBe(4);
});

test("TablePresenter full date", () => {
  expect(rows[0].createdAt.full).toMatch("full");
});

test("TablePresenter relative date", () => {
  expect(rows[0].createdAt.relative).toMatch("relative");
});

test("TablePresenter converts column index to name correctly", () => {
  expect(tablePresenter.getColumnNameForIndex(0)).toEqual("id");
  expect(tablePresenter.getColumnNameForIndex(1)).toEqual("state");
  expect(tablePresenter.getColumnNameForIndex(-1)).toBeUndefined();
  expect(tablePresenter.getColumnNameForIndex(10)).toBeUndefined();
});

test("TablePresenter converts column name to index correctly", () => {
  expect(tablePresenter.getIndexForColumnName("id")).toEqual(0);
  expect(tablePresenter.getIndexForColumnName("state")).toEqual(1);
  expect(tablePresenter.getIndexForColumnName("history")).toEqual(-1);
  expect(tablePresenter.getIndexForColumnName(undefined)).toEqual(-1);
});

test("TablePresenter returns sortable columns correctly", () => {
  expect(tablePresenter.getSortableColumnNames()).toEqual([
    "state",
    "created_at",
    "last_updated",
  ]);
});

describe("TablePresenter with identity ", () => {
  const presenterWithIdentity = new InventoryTablePresenter(
    new DummyDatePresenter(),
    new AttributesPresenter(),
    new DummyActionPresenter(),
    new DummyStatePresenter(),
    "service_id",
    "Service ID"
  );
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
      "service_id"
    );
    expect(presenterWithIdentity.getColumnNameForIndex(1)).toEqual("state");
    expect(presenterWithIdentity.getColumnNameForIndex(-1)).toBeUndefined();
    expect(presenterWithIdentity.getColumnNameForIndex(10)).toBeUndefined();
  });

  test("converts column name to index correctly", () => {
    expect(presenterWithIdentity.getIndexForColumnName("id")).toEqual(-1);
    expect(presenterWithIdentity.getIndexForColumnName("service_id")).toEqual(
      0
    );
    expect(presenterWithIdentity.getIndexForColumnName("state")).toEqual(1);
    expect(presenterWithIdentity.getIndexForColumnName("history")).toEqual(-1);
    expect(presenterWithIdentity.getIndexForColumnName(undefined)).toEqual(-1);
  });
});
