import { FeatureModule } from "@/Core";
import * as GraphiQL from "@S/GraphiQL/Core/Route";
import { graphiqlMessages } from "./messages";

/**
 * The GraphiQL editor for the orchestrator's GraphQL API. Its page pulls in graphiql, which is
 * heavy and rarely opened, so it is not preloaded: it is only fetched when the route is opened.
 */
export const graphiqlFeature: FeatureModule = {
  id: "graphiql",
  version: APP_VERSION,
  messages: graphiqlMessages,
  preload: false,
  routes: [
    {
      route: GraphiQL.route,
      page: () => import("@S/GraphiQL/UI").then((module) => module.GraphiQLPage),
    },
  ],
};
