import * as Agents from "@S/Agents/Core/Route";
import * as Facts from "@S/Facts/Core/Route";
import * as Resource from "@S/Resource/Core/Route";
import * as ResourceDetails from "@S/ResourceDetails/Core/Route";
import * as DiscoveredResources from "@S/ResourceDiscovery/Core/Route";
import * as DiscoveredResourceDetails from "@S/ResourceDiscoveryDetails/Core/Route";
import { FeatureModule } from "@inmanta/web-console-core";
import { resourceManagerMessages } from "./messages";

/**
 * The Resource Manager: resources, discovered resources, agents and facts.
 */
export const resourceManagerFeature: FeatureModule = {
  id: "resource-manager",
  version: APP_VERSION,
  messages: resourceManagerMessages,
  routes: [
    {
      route: Agents.route,
      page: () => import("@S/Agents/UI").then((module) => module.AgentsPage),
    },
    {
      route: DiscoveredResources.route,
      page: () =>
        import("@S/ResourceDiscovery/UI").then((module) => module.DiscoveredResourcesPage),
    },
    {
      route: DiscoveredResourceDetails.route,
      page: () =>
        import("@S/ResourceDiscoveryDetails/UI").then(
          (module) => module.DiscoveredResourceDetailsPage
        ),
    },
    {
      route: Facts.route,
      page: () => import("@S/Facts/UI").then((module) => module.FactsPage),
    },
    {
      route: ResourceDetails.route,
      page: () => import("@S/ResourceDetails/UI").then((module) => module.ResourceDetailsPage),
    },
    {
      route: Resource.route,
      page: () => import("@S/Resource/UI/ResourcesPage").then((module) => module.ResourcesPage),
    },
  ],
  navigation: [
    { kind: "Resources", group: "resourceManager" },
    {
      kind: "DiscoveredResources",
      group: "resourceManager",
      isVisible: (orchestratorProvider) => orchestratorProvider.isResourceDiscoveryEnabled(),
    },
    { kind: "Agents", group: "resourceManager" },
    { kind: "Facts", group: "resourceManager" },
  ],
};
