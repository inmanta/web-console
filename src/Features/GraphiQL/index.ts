import { FeatureModule } from "@/Core";
import * as GraphiQL from "@S/GraphiQL/Core/Route";

/**
 * The GraphiQL editor for the orchestrator's GraphQL API.
 */
export const graphiqlFeature: FeatureModule = {
  id: "graphiql",
  version: APP_VERSION,
  routes: [
    {
      route: GraphiQL.route,
      page: () => import("@S/GraphiQL/UI").then((module) => module.GraphiQLPage),
    },
  ],
};
