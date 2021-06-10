import {
  Catalog,
  CreateInstance,
  Diagnose,
  Events,
  History,
  Inventory,
} from "./Route";
import { getLineageFromRoute, getRouteWithParamsFromUrl } from "./Utils";

it.each`
  route             | routeTxt            | length | result                                  | resultTxt
  ${Catalog}        | ${"Catalog"}        | ${1}   | ${[Catalog]}                            | ${"[Catalog]"}
  ${Inventory}      | ${"Inventory"}      | ${2}   | ${[Catalog, Inventory]}                 | ${"[Catalog, Inventory]"}
  ${CreateInstance} | ${"CreateInstance"} | ${3}   | ${[Catalog, Inventory, CreateInstance]} | ${"[Catalog, Inventory, CreateInstance]"}
  ${History}        | ${"History"}        | ${3}   | ${[Catalog, Inventory, History]}        | ${"[Catalog, Inventory, History]"}
  ${Events}         | ${"Events"}         | ${3}   | ${[Catalog, Inventory, Events]}         | ${"[Catalog, Inventory, Events]"}
  ${Diagnose}       | ${"Diagnose"}       | ${3}   | ${[Catalog, Inventory, Diagnose]}       | ${"[Catalog, Inventory, Diagnose]"}
`(
  "GIVEN getLineageFromRoute WHEN passed $routeTxt THEN returns routes #$length $resultTxt",
  ({ route, length, result }) => {
    const routes = getLineageFromRoute(route);
    expect(routes).toHaveLength(length);
    expect(routes).toEqual(result);
  }
);

it.each`
  url                                          | result                                             | resultTxt
  ${"/"}                                       | ${undefined}                                       | ${"undefined"}
  ${"/lsm/catalog"}                            | ${[Catalog, {}]}                                   | ${"[Catalog, {}]"}
  ${"/lsm/catalog/xyz/inventory"}              | ${[Inventory, { service: "xyz" }]}                 | ${"[Inventory, {service: 'xyz'}]"}
  ${"/lsm/catalog/xyz/inventory/add"}          | ${[CreateInstance, { service: "xyz" }]}            | ${"[CreateInstance, {service: 'xyz'}]"}
  ${"/lsm/catalog/xyz/inventory/123/history"}  | ${[History, { service: "xyz", instance: "123" }]}  | ${"[History, {service: 'xyz', instance: '123'}]"}
  ${"/lsm/catalog/xyz/inventory/123/events"}   | ${[Events, { service: "xyz", instance: "123" }]}   | ${"[Events, {service: 'xyz', instance: '123'}]"}
  ${"/lsm/catalog/xyz/inventory/123/diagnose"} | ${[Diagnose, { service: "xyz", instance: "123" }]} | ${"[Diagnose, {service: 'xyz', instance: '123'}]"}
`(
  "GIVEN getRouteWithParamsFromUrl WHEN passed '$url' THEN returns $resultTxt",
  ({ url, result }) => {
    expect(getRouteWithParamsFromUrl(url)).toEqual(result);
  }
);
