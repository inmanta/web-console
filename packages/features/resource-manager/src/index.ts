import { FeatureModule } from "@inmanta/web-console-core";
import * as Agents from "@inmanta/web-console-feature-resource-manager/Slices/Agents/Core/Route";
import * as Facts from "@inmanta/web-console-feature-resource-manager/Slices/Facts/Core/Route";
import * as Resource from "@inmanta/web-console-feature-resource-manager/Slices/Resource/Core/Route";
import * as ResourceDetails from "@inmanta/web-console-feature-resource-manager/Slices/ResourceDetails/Core/Route";
import * as DiscoveredResources from "@inmanta/web-console-feature-resource-manager/Slices/ResourceDiscovery/Core/Route";
import * as DiscoveredResourceDetails from "@inmanta/web-console-feature-resource-manager/Slices/ResourceDiscoveryDetails/Core/Route";
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
      page: () =>
        import("@inmanta/web-console-feature-resource-manager/Slices/Agents/UI").then(
          (module) => module.AgentsPage
        ),
    },
    {
      route: DiscoveredResources.route,
      page: () =>
        import("@inmanta/web-console-feature-resource-manager/Slices/ResourceDiscovery/UI").then(
          (module) => module.DiscoveredResourcesPage
        ),
    },
    {
      route: DiscoveredResourceDetails.route,
      page: () =>
        import("@inmanta/web-console-feature-resource-manager/Slices/ResourceDiscoveryDetails/UI").then(
          (module) => module.DiscoveredResourceDetailsPage
        ),
    },
    {
      route: Facts.route,
      page: () =>
        import("@inmanta/web-console-feature-resource-manager/Slices/Facts/UI").then(
          (module) => module.FactsPage
        ),
    },
    {
      route: ResourceDetails.route,
      page: () =>
        import("@inmanta/web-console-feature-resource-manager/Slices/ResourceDetails/UI").then(
          (module) => module.ResourceDetailsPage
        ),
    },
    {
      route: Resource.route,
      page: () =>
        import("@inmanta/web-console-feature-resource-manager/Slices/Resource/UI/ResourcesPage").then(
          (module) => module.ResourcesPage
        ),
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
