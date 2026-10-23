import { PrimaryRouteManager } from "./PrimaryRouteManager";

const routeManager = PrimaryRouteManager("");

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
    expect(routeManager.getRelatedUrlWithoutParams(inputUrl)).toEqual(outputUrl);
  }
);

const { Home, Catalog, Inventory, CreateInstance, Events, Diagnose } =
  routeManager.getRouteDictionary();

it.each`
  route             | routeTxt            | length | result                                        | resultTxt
  ${Catalog}        | ${"Catalog"}        | ${2}   | ${[Home, Catalog]}                            | ${"[Home, Catalog]"}
  ${Inventory}      | ${"Inventory"}      | ${3}   | ${[Home, Catalog, Inventory]}                 | ${"[Home, Catalog, Inventory]"}
  ${CreateInstance} | ${"CreateInstance"} | ${4}   | ${[Home, Catalog, Inventory, CreateInstance]} | ${"[Home, Catalog, Inventory, CreateInstance]"}
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
  expect(routeManager.getUrlForApiUri("/api/v2/compilereport/123")).toMatch("/compilereports/123");
});

test("GIVEN '/lsm/catalog' THEN breadcrumbs should be ['Home','Catalog']", () => {
  const crumbs = routeManager.getCrumbs("/lsm/catalog");

  expect(crumbs).toHaveLength(2);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: true,
    },
  ]);
});

test("GIVEN '/lsm/catalog/xyz/inventory' THEN breadcrumbs should be ['Home', 'Catalog', 'Inventory']", () => {
  const crumbs = routeManager.getCrumbs("/lsm/catalog/xyz/inventory");

  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/",
      active: false,
    },
    {
      kind: "Catalog",
      label: "Service Catalog",
      url: "/lsm/catalog",
      active: false,
    },
    {
      kind: "Inventory",
      label: "Service Inventory: xyz",
      url: "/lsm/catalog/xyz/inventory",
      active: true,
    },
  ]);
});

test("GIVEN '/resources/123' THEN breadcrumbs should be ['Home', 'Resources', 'Resource Details']", () => {
  const crumbs = routeManager.getCrumbs("/resources/123");

  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Home",
      label: "Home",
      url: "/",
      active: false,
    },
    {
      kind: "Resources",
      label: "Resources",
      url: "/resources",
      active: false,
    },
    {
      kind: "ResourceDetails",
      label: "Resource Details",
      url: "/resources/123",
      active: true,
    },
  ]);
});

test.each`
  resourceId                                                   | encodedId
  ${"std::File[agent1,path=/tmp/file]"}                        | ${"std%3A%3AFile%5Bagent1%2Cpath%3D%2Ftmp%2Ffile%5D"}
  ${'exec::Run[agent1,command=sh -c "a\n/usr/bin/true\r\nb"]'} | ${"exec%3A%3ARun%5Bagent1%2Ccommand%3Dsh%20-c%20%22a%0A%2Fusr%2Fbin%2Ftrue%0D%0Ab%22%5D"}
`(
  "GIVEN resource id $resourceId WHEN getting the url and its breadcrumbs THEN the id is encoded once",
  ({ resourceId, encodedId }) => {
    const url = routeManager.getUrl("ResourceDetails", { resourceId });

    expect(url).toEqual(`/resources/${encodedId}`);
    expect(routeManager.getCrumbs(url).at(-1)?.url).toEqual(url);
  }
);
