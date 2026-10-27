import { stubRoute } from "@inmanta/web-console-test-utils";
import { PrimaryRouteManager } from "./PrimaryRouteManager";

const catalogRoute = stubRoute("Catalog", "/lsm/catalog", {
  parent: "Dashboard",
  label: () => "Service Catalog",
});
const inventoryRoute = stubRoute("Inventory", "/lsm/catalog/:service/inventory", {
  parent: "Catalog",
  label: ({ service }) => `Service Inventory: ${service}`,
});

// A part of the app's route table, as the features declare it.
const routes = [
  stubRoute("Dashboard", "/dashboard", { label: () => "Dashboard" }),
  catalogRoute,
  inventoryRoute,
  stubRoute("CreateInstance", "/lsm/catalog/:service/inventory/add", { parent: "Inventory" }),
  stubRoute("EditInstance", "/lsm/catalog/:service/inventory/:instance/edit", {
    parent: "Inventory",
  }),
  stubRoute("Events", "/lsm/catalog/:service/inventory/:instance/events", {
    parent: "Inventory",
  }),
  stubRoute("Diagnose", "/lsm/catalog/:service/inventory/:instance/diagnose", {
    parent: "Inventory",
  }),
  stubRoute("InstanceDetails", "/lsm/catalog/:service/inventory/:instance/:instanceId/details", {
    parent: "Inventory",
    label: ({ instance }) => `Instance Details: ${instance}`,
  }),
  stubRoute("Resources", "/resources", { parent: "Dashboard", label: () => "Resources" }),
  stubRoute("ResourceDetails", "/resources/:resourceId", {
    parent: "Resources",
    label: () => "Resource Details",
  }),
  stubRoute("CompileReports", "/compilereports", { parent: "Dashboard" }),
  stubRoute("CompileDetails", "/compilereports/:id", { parent: "CompileReports" }),
  stubRoute("Settings", "/settings", { parent: "Dashboard" }),
];

const routeManager = PrimaryRouteManager("", routes);

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

const Dashboard = routeManager.getRoute("Dashboard");
const Catalog = routeManager.getRoute("Catalog");
const Inventory = routeManager.getRoute("Inventory");
const CreateInstance = routeManager.getRoute("CreateInstance");
const Events = routeManager.getRoute("Events");
const Diagnose = routeManager.getRoute("Diagnose");

it.each`
  route             | routeTxt            | length | result                                             | resultTxt
  ${Catalog}        | ${"Catalog"}        | ${2}   | ${[Dashboard, Catalog]}                            | ${"[Dashboard, Catalog]"}
  ${Inventory}      | ${"Inventory"}      | ${3}   | ${[Dashboard, Catalog, Inventory]}                 | ${"[Dashboard, Catalog, Inventory]"}
  ${CreateInstance} | ${"CreateInstance"} | ${4}   | ${[Dashboard, Catalog, Inventory, CreateInstance]} | ${"[Dashboard, Catalog, Inventory, CreateInstance]"}
  ${Events}         | ${"Events"}         | ${4}   | ${[Dashboard, Catalog, Inventory, Events]}         | ${"[Dashboard, Catalog, Inventory, Events]"}
  ${Diagnose}       | ${"Diagnose"}       | ${4}   | ${[Dashboard, Catalog, Inventory, Diagnose]}       | ${"[Dashboard, Catalog, Inventory, Diagnose]"}
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

test("GIVEN '/lsm/catalog' THEN breadcrumbs should be ['Dashboard','Catalog']", () => {
  const crumbs = routeManager.getCrumbs("/lsm/catalog");

  expect(crumbs).toHaveLength(2);
  expect(crumbs).toEqual([
    {
      kind: "Dashboard",
      label: "Dashboard",
      url: "/dashboard",
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

test("GIVEN '/lsm/catalog/xyz/inventory' THEN breadcrumbs should be ['Dashboard', 'Catalog', 'Inventory']", () => {
  const crumbs = routeManager.getCrumbs("/lsm/catalog/xyz/inventory");

  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Dashboard",
      label: "Dashboard",
      url: "/dashboard",
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

test("GIVEN '/resources/123' THEN breadcrumbs should be ['Dashboard', 'Resources', 'Resource Details']", () => {
  const crumbs = routeManager.getCrumbs("/resources/123");

  expect(crumbs).toHaveLength(3);
  expect(crumbs).toEqual([
    {
      kind: "Dashboard",
      label: "Dashboard",
      url: "/dashboard",
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

test("GIVEN a route param containing a space WHEN building a url with getUrl and reading it back with getCrumbs THEN the value is not double encoded", () => {
  // Regression test: getUrl used to encodeURIComponent params before handing them to
  // react-router's generatePath, which encodes them again internally. A value like
  // "Parent 1" would survive the single decodeURIComponent done by consumers (e.g.
  // PageBreadcrumbs) as "Parent%201" instead of "Parent 1".
  const url = routeManager.getUrl("InstanceDetails", {
    service: "basic-service",
    instance: "Parent 1",
    instanceId: "Parent 1",
  });

  const crumbs = routeManager.getCrumbs(url);
  const instanceCrumb = crumbs.find((crumb) => crumb.kind === "InstanceDetails");

  expect(decodeURIComponent(instanceCrumb?.label ?? "")).toEqual("Instance Details: Parent 1");
});

describe("Given a route manager with only some routes registered", () => {
  const partialRouteManager = PrimaryRouteManager("", [catalogRoute, inventoryRoute]);

  it("THEN has() is true for registered routes only", () => {
    expect(partialRouteManager.has("Catalog")).toBe(true);
    expect(partialRouteManager.has("Inventory")).toBe(true);
    expect(partialRouteManager.has("CompileDetails")).toBe(false);
  });

  it("THEN getRoutes() only returns the registered routes", () => {
    expect(partialRouteManager.getRoutes().map(({ kind }) => kind)).toEqual([
      "Catalog",
      "Inventory",
    ]);
  });

  it("THEN getRoute() throws for an unregistered route", () => {
    expect(() => partialRouteManager.getRoute("CompileDetails")).toThrow(
      'Route "CompileDetails" is not registered.'
    );
  });

  it("THEN breadcrumbs stop at the first unregistered parent", () => {
    const crumbs = partialRouteManager.getCrumbs("/lsm/catalog/xyz/inventory");

    expect(crumbs.map(({ kind }) => kind)).toEqual(["Catalog", "Inventory"]);
  });

  it("THEN compile report api uris don't resolve to a url", () => {
    expect(partialRouteManager.getUrlForApiUri("/api/v2/compilereport/123")).toBeUndefined();
    expect(partialRouteManager.getParamsFromUrl("/api/v2/compilereport/123")).toBeUndefined();
  });
});

test("GIVEN a route registered twice THEN the route manager throws", () => {
  expect(() => PrimaryRouteManager("", [catalogRoute, catalogRoute])).toThrow(
    'Route "Catalog" is registered more than once.'
  );
});
