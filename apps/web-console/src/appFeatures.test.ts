import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { features, routes } from "./appFeatures";

describe("appFeatures", () => {
  test("GIVEN the features of the app THEN every feature has a unique id", () => {
    const ids = features.map(({ id }) => id);

    expect(new Set(ids).size).toEqual(ids.length);
  });

  test("GIVEN the routes of the features THEN they build a route table", () => {
    expect(PrimaryRouteManager("", routes).getRoutes()).toHaveLength(routes.length);
  });

  test("GIVEN the navigation of the features THEN every entry links to a route of the app", () => {
    const routeManager = PrimaryRouteManager("", routes);
    const kinds = features.flatMap(({ navigation = [] }) => navigation.map(({ kind }) => kind));

    expect(kinds.filter((kind) => !routeManager.has(kind))).toEqual([]);
  });
});
