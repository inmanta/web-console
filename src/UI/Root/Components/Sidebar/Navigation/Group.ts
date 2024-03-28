import { FeatureManager, RouteManager } from "@/Core";
import { words } from "@/UI/words";
/**
 * Interface that represents a Group of links in the sidebar navigation
 */
interface Group {
  id: string;
  title: string;
  links: Link[];
}

/**
 * Interface that represents a link in the sidebar navigation
 */
interface Link {
  id: string;
  label: string;
  url: string;
  external: boolean;
  locked: boolean;
  statusIndication: boolean;
}

/**
 * Returns the environment group of links
 * @param routeManager - RouteManager
 * @param isEnvPresent - boolean
 * @returns Group
 */
export const envrionment = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
): Group => ({
  id: words("navigation.environment"),
  title: words("navigation.environment"),
  links: [
    {
      id: "Dashboard",
      label: routeManager.getRoute("Dashboard").generateLabel(undefined),
      url: routeManager.getRoute("Dashboard").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "Settings",
      label: routeManager.getRoute("Settings").generateLabel(undefined),
      url: routeManager.getRoute("Settings").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
  ],
});

/**
 * Returns the lifecycle service manager group of links
 *
 * @param routeManager - RouteManager
 * @param isEnvPresent - boolean
 * @param featureManager - FeatureManager
 * @returns Group
 */
export const lifecycleServiceManager = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
  featureManager: FeatureManager,
): Group => ({
  id: "LifecycleServiceManager",
  title: words("navigation.lifecycleServiceManager"),
  links: [
    {
      id: "Catalog",
      label: routeManager.getRoute("Catalog").generateLabel(undefined),
      url: routeManager.getRoute("Catalog").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    ...(featureManager.isOrderViewEnabled()
      ? [
          {
            id: "Orders",
            label: routeManager.getRoute("Orders").generateLabel(undefined),
            url: routeManager.getRoute("Orders").path,
            external: false,
            locked: !isEnvPresent,
            statusIndication: false,
          },
        ]
      : []),
  ],
});

/**
 * Returns the orchestration engine group of links
 *
 * @param routeManager - RouteManager
 * @param isEnvPresent - boolean
 * @returns Group
 */
export const orchestrationEngine = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
): Group => ({
  id: "OrchestrationEngine",
  title: words("navigation.orchestrationEngine"),
  links: [
    {
      id: "DesiredState",
      label: routeManager.getRoute("DesiredState").generateLabel(undefined),
      url: routeManager.getRoute("DesiredState").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "CompileReports",
      label: routeManager.getRoute("CompileReports").generateLabel(undefined),
      url: routeManager.getRoute("CompileReports").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: true,
    },
    {
      id: "Parameters",
      label: routeManager.getRoute("Parameters").generateLabel(undefined),
      url: routeManager.getRoute("Parameters").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
  ],
});

/**
 * Returns the resource manager group of links
 *
 * @param routeManager - RouteManager
 * @param isEnvPresent - boolean
 * @param featureManager - FeatureManager
 * @returns Group
 */
export const resourceManager = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
  featureManager: FeatureManager,
): Group => ({
  id: "ResourceManager",
  title: words("navigation.resourceManager"),
  links: [
    {
      id: "Resources",
      label: routeManager.getRoute("Resources").generateLabel(undefined),
      url: routeManager.getRoute("Resources").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    ...(featureManager.isResourceDiscoveryEnabled()
      ? [
          {
            id: "Discovered Resources",
            label: routeManager
              .getRoute("DiscoveredResources")
              .generateLabel(undefined),
            url: routeManager.getRoute("DiscoveredResources").path,
            external: false,
            locked: !isEnvPresent,
            statusIndication: false,
          },
        ]
      : []),
    {
      id: "Agents",
      label: routeManager.getRoute("Agents").generateLabel(undefined),
      url: routeManager.getRoute("Agents").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "Facts",
      label: routeManager.getRoute("Facts").generateLabel(undefined),
      url: routeManager.getRoute("Facts").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
  ],
});
