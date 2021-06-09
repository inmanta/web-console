import {
  CatalogPage,
  CreateInstancePage,
  DiagnosePage,
  EventsPage,
  HistoryPage,
  InventoryPage,
  getLineageFromPage,
  getPageWithParamsFromUrl,
} from "./Pages";

it.each`
  page                  | pageTxt             | length | result                                              | resultTxt
  ${CatalogPage}        | ${"Catalog"}        | ${1}   | ${[CatalogPage]}                                    | ${"[Catalog]"}
  ${InventoryPage}      | ${"Inventory"}      | ${2}   | ${[CatalogPage, InventoryPage]}                     | ${"[Catalog, Inventory]"}
  ${CreateInstancePage} | ${"CreateInstance"} | ${3}   | ${[CatalogPage, InventoryPage, CreateInstancePage]} | ${"[Catalog, Inventory, CreateInstance]"}
  ${HistoryPage}        | ${"History"}        | ${3}   | ${[CatalogPage, InventoryPage, HistoryPage]}        | ${"[Catalog, Inventory, History]"}
  ${EventsPage}         | ${"Events"}         | ${3}   | ${[CatalogPage, InventoryPage, EventsPage]}         | ${"[Catalog, Inventory, Events]"}
  ${DiagnosePage}       | ${"Diagnose"}       | ${3}   | ${[CatalogPage, InventoryPage, DiagnosePage]}       | ${"[Catalog, Inventory, Diagnose]"}
`(
  "GIVEN getLineageFromPage WHEN passed $pageTxt THEN returns pages #$length $resultTxt",
  ({ page, length, result }) => {
    const pages = getLineageFromPage(page);
    expect(pages).toHaveLength(length);
    expect(pages).toEqual(result);
  }
);

it.each`
  url                                          | result                                                 | resultTxt
  ${"/"}                                       | ${undefined}                                           | ${"undefined"}
  ${"/lsm/catalog"}                            | ${[CatalogPage, {}]}                                   | ${"[Catalog, {}]"}
  ${"/lsm/catalog/xyz/inventory"}              | ${[InventoryPage, { service: "xyz" }]}                 | ${"[Inventory, {service: 'xyz'}]"}
  ${"/lsm/catalog/xyz/inventory/add"}          | ${[CreateInstancePage, { service: "xyz" }]}            | ${"[CreateInstance, {service: 'xyz'}]"}
  ${"/lsm/catalog/xyz/inventory/123/history"}  | ${[HistoryPage, { service: "xyz", instance: "123" }]}  | ${"[History, {service: 'xyz', instance: '123'}]"}
  ${"/lsm/catalog/xyz/inventory/123/events"}   | ${[EventsPage, { service: "xyz", instance: "123" }]}   | ${"[Events, {service: 'xyz', instance: '123'}]"}
  ${"/lsm/catalog/xyz/inventory/123/diagnose"} | ${[DiagnosePage, { service: "xyz", instance: "123" }]} | ${"[Diagnose, {service: 'xyz', instance: '123'}]"}
`(
  "GIVEN getPageWithParamsFromUrl WHEN passed '$url' THEN returns $resultTxt",
  ({ url, result }) => {
    expect(getPageWithParamsFromUrl(url)).toEqual(result);
  }
);
