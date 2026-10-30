import { getFeatureRoutes } from "@inmanta/web-console-core";
import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { graphiqlFeature } from ".";

describe("graphiqlFeature contributions", () => {
  it("adds a link to the GraphiQL page to the Developer Tools menu", () => {
    const routeManager = PrimaryRouteManager("", getFeatureRoutes([graphiqlFeature]));
    const links = graphiqlFeature.contributions?.["header.developerTools.actions"] ?? [];

    expect(links.map(({ id }) => id)).toEqual(["graphiql"]);
    expect(links[0].getUrl(routeManager, {})).toBe(routeManager.getUrl("GraphiQL", undefined));
  });
});
