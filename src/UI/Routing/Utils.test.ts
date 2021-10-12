import {
  Catalog,
  CreateInstance,
  Diagnose,
  Events,
  History,
  Home,
  Inventory,
} from "./Route";
import { getLineageFromRoute, getRouteWithParamsFromUrl } from "./Utils";

it.each`
  route             | routeTxt            | length | result                                        | resultTxt
  ${Catalog}        | ${"Catalog"}        | ${2}   | ${[Home, Catalog]}                            | ${"[Home, Catalog]"}
  ${Inventory}      | ${"Inventory"}      | ${3}   | ${[Home, Catalog, Inventory]}                 | ${"[Home, Catalog, Inventory]"}
  ${CreateInstance} | ${"CreateInstance"} | ${4}   | ${[Home, Catalog, Inventory, CreateInstance]} | ${"[Home, Catalog, Inventory, CreateInstance]"}
  ${History}        | ${"History"}        | ${4}   | ${[Home, Catalog, Inventory, History]}        | ${"[Home, Catalog, Inventory, History]"}
  ${Events}         | ${"Events"}         | ${4}   | ${[Home, Catalog, Inventory, Events]}         | ${"[Home, Catalog, Inventory, Events]"}
  ${Diagnose}       | ${"Diagnose"}       | ${4}   | ${[Home, Catalog, Inventory, Diagnose]}       | ${"[Home, Catalog, Inventory, Diagnose]"}
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
  ${"/"}                                       | ${[Home, {}]}                                      | ${"[Home, {}]"}
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
