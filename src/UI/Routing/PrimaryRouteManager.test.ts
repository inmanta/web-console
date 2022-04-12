import { PrimaryRouteManager } from "./PrimaryRouteManager";

const routeManager = new PrimaryRouteManager("");

test.each`
  inputUrl                                                | outputUrl
  ${"/lsm/catalog"}                                       | ${"/lsm/catalog"}
  ${"/lsm/catalog/serviceName/inventory"}                 | ${"/lsm/catalog"}
  ${"/lsm/catalog/serviceName/inventory/instanceId/edit"} | ${"/lsm/catalog"}
  ${"/resources"}                                         | ${"/resources"}
  ${"/resources/resourceId"}                              | ${"/resources"}
  ${"/compilereports"}                                    | ${"/compilereports"}
  ${"/compilereports/reportId"}                           | ${"/compilereports"}
  ${"/settings"}                                          | ${"/settings"}
`(
  "GIVEN RouteManager.getRelatedUrlWithoutParams WHEN $inputUrl THEN returns $outputUrl",
  async ({ inputUrl, outputUrl }) => {
    expect(routeManager.getRelatedUrlWithoutParams(inputUrl)).toEqual(
      outputUrl
    );
  }
);

const { Home, Catalog, Inventory, CreateInstance, History, Events, Diagnose } =
  routeManager.getRouteDictionary();

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
    const routes = routeManager.getLineageFromRoute(route);
    expect(routes).toHaveLength(length);
    expect(routes).toEqual(result);
  }
);

it.each`
  url                                          | result                                                              | resultTxt
  ${"/"}                                       | ${{ route: Home, params: undefined }}                               | ${"Home(undefined)"}
  ${"/lsm/catalog"}                            | ${{ route: Catalog, params: undefined }}                            | ${"Catalog(undefined)"}
  ${"/lsm/catalog/xyz/inventory"}              | ${{ route: Inventory, params: { service: "xyz" } }}                 | ${"Inventory({service: 'xyz'})"}
  ${"/lsm/catalog/xyz/inventory/add"}          | ${{ route: CreateInstance, params: { service: "xyz" } }}            | ${"CreateInstance({service: 'xyz'})"}
  ${"/lsm/catalog/xyz/inventory/123/history"}  | ${{ route: History, params: { service: "xyz", instance: "123" } }}  | ${"History({service: 'xyz', instance: '123'})"}
  ${"/lsm/catalog/xyz/inventory/123/events"}   | ${{ route: Events, params: { service: "xyz", instance: "123" } }}   | ${"Events({service: 'xyz', instance: '123'})"}
  ${"/lsm/catalog/xyz/inventory/123/diagnose"} | ${{ route: Diagnose, params: { service: "xyz", instance: "123" } }} | ${"Diagnose({service: 'xyz', instance: '123'})"}
`(
  "GIVEN getRouteWithParamsFromUrl WHEN passed '$url' THEN returns $resultTxt",
  ({ url, result }) => {
    expect(routeManager.getRouteMatchFromUrl(url)).toEqual(result);
  }
);

test("Given getUrlForApiUri When uri is unknown Then returns undefined", () => {
  expect(routeManager.getUrlForApiUri("/api/v2/service/123")).toBeUndefined();
});

test("Given getUrlForApiUri When uri is known Then returns url", () => {
  expect(routeManager.getUrlForApiUri("/api/v2/compilereport/123")).toMatch(
    "/compilereports/123"
  );
});
