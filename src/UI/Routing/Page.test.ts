import {
  CatalogPage,
  CreateInstancePage,
  DiagnosePage,
  EventsPage,
  getPagesFromPage,
  HistoryPage,
  InventoryPage,
} from "./Page";

test("GIVEN getPagesFromPage WHEN passed Catalog THEN returns 1 page ['Catalog']", () => {
  const pages = getPagesFromPage(CatalogPage);
  expect(pages).toHaveLength(1);
  expect(pages).toEqual([CatalogPage]);
});

test("GIVEN getPagesFromPage WHEN passed Inventory THEN returns 2 pages ['Catalog', 'Inventory']", () => {
  const pages = getPagesFromPage(InventoryPage);
  expect(pages).toHaveLength(2);
  expect(pages).toEqual([CatalogPage, InventoryPage]);
});

test("GIVEN getPagesFromPage WHEN passed History THEN returns 3 pages ['Catalog','Inventory','History']", () => {
  const pages = getPagesFromPage(HistoryPage);
  expect(pages).toHaveLength(3);
  expect(pages).toEqual([CatalogPage, InventoryPage, HistoryPage]);
});

test("GIVEN getPagesFromPage WHEN passed Events THEN returns 3 pages ['Catalog','Inventory','Events']", () => {
  const pages = getPagesFromPage(EventsPage);
  expect(pages).toHaveLength(3);
  expect(pages).toEqual([CatalogPage, InventoryPage, EventsPage]);
});

test("GIVEN getPagesFromPage WHEN passed CreateInstance THEN returns 3 pages ['Catalog','Inventory','CreateInstance']", () => {
  const pages = getPagesFromPage(CreateInstancePage);
  expect(pages).toHaveLength(3);
  expect(pages).toEqual([CatalogPage, InventoryPage, CreateInstancePage]);
});

test("GIVEN getPagesFromPage WHEN passed Diagnose THEN returns 3 pages ['Catalog','Inventory','Diagnose']", () => {
  const pages = getPagesFromPage(DiagnosePage);
  expect(pages).toHaveLength(3);
  expect(pages).toEqual([CatalogPage, InventoryPage, DiagnosePage]);
});
