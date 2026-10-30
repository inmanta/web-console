import { CodeIcon } from "@patternfly/react-icons";
import { FeatureModule, words } from "@inmanta/web-console-core";
import * as GraphiQL from "@inmanta/web-console-feature-graphiql/Slices/GraphiQL/Core/Route";
import { graphiqlMessages } from "./messages";

/**
 * The GraphiQL editor for the orchestrator's GraphQL API. Its page pulls in graphiql, which is
 * heavy and rarely opened, so it is not preloaded: it is only fetched when the route is opened.
 * It adds its link to the Developer Tools menu in the header.
 */
export const graphiqlFeature: FeatureModule = {
  id: "graphiql",
  version: APP_VERSION,
  messages: graphiqlMessages,
  preload: false,
  routes: [
    {
      route: GraphiQL.route,
      page: () =>
        import("@inmanta/web-console-feature-graphiql/Slices/GraphiQL/UI").then(
          (module) => module.GraphiQLPage
        ),
    },
  ],
  contributions: {
    "header.developerTools.actions": [
      {
        id: "graphiql",
        getLabel: () => words("graphiql.title"),
        icon: CodeIcon,
        getUrl: (routeManager) => routeManager.getUrl("GraphiQL", undefined),
      },
    ],
  },
};
