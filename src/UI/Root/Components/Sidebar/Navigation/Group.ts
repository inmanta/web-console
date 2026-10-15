import { OrchestratorProvider, RouteKind, RouteManager } from "@/Core";
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
 * Returns the sidebar link to a route without params, as a list to spread into a group.
 * The list is empty when the route is not registered, so the link is left out instead of broken.
 *
 * @param {RouteManager} routeManager
 * @param {RouteKind} kind - the route to link to
 * @param {boolean} isEnvPresent
 * @param {object} options - the link id (defaults to the kind) and whether it shows a status indication
 * @returns Link[]
 */
const routeLink = (
  routeManager: RouteManager,
  kind: RouteKind,
  isEnvPresent: boolean,
  { id = kind, statusIndication = false }: { id?: string; statusIndication?: boolean } = {}
): Link[] => {
  if (!routeManager.has(kind)) {
    return [];
  }

  const route = routeManager.getRoute(kind);

  return [
    {
      id,
      label: route.generateLabel(undefined),
      url: route.path,
      external: false,
      locked: !isEnvPresent,
      statusIndication,
    },
  ];
};

/**
 * Returns the environment group of links
 * @param {RouteManager} routeManager
 * @param {boolean} isEnvPresent
 * @returns Group
 */
export const envrionment = (routeManager: RouteManager, isEnvPresent: boolean): Group => ({
  id: words("navigation.environment"),
  title: words("navigation.environment"),
  links: [
    ...routeLink(routeManager, "Dashboard", isEnvPresent),
    ...routeLink(routeManager, "Settings", isEnvPresent),
  ],
});

/**
 * Returns the lifecycle service manager group of links
 *
 * @param {RouteManager} routeManager
 * @param {boolean} isEnvPresent
 * @param {OrchestratorProvider} orchestratorProvider
 * @returns Group
 */
export const lifecycleServiceManager = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
  orchestratorProvider: OrchestratorProvider
): Group => ({
  id: "LifecycleServiceManager",
  title: words("navigation.lifecycleServiceManager"),
  links: [
    ...routeLink(routeManager, "Catalog", isEnvPresent),
    ...(orchestratorProvider.isOrderViewEnabled()
      ? routeLink(routeManager, "Orders", isEnvPresent)
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
export const orchestrationEngine = (routeManager: RouteManager, isEnvPresent: boolean): Group => ({
  id: "OrchestrationEngine",
  title: words("navigation.orchestrationEngine"),
  links: [
    ...routeLink(routeManager, "DesiredState", isEnvPresent),
    ...routeLink(routeManager, "CompileReports", isEnvPresent, { statusIndication: true }),
    ...routeLink(routeManager, "Parameters", isEnvPresent),
  ],
});

/**
 * Returns the resource manager group of links
 *
 * @param {RouteManager} routeManager
 * @param {boolean } isEnvPresent
 * @param {OrchestratorProvider} orchestratorProvider
 * @returns Group
 */
export const resourceManager = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
  orchestratorProvider: OrchestratorProvider
): Group => ({
  id: "ResourceManager",
  title: words("navigation.resourceManager"),
  links: [
    ...routeLink(routeManager, "Resources", isEnvPresent),
    ...(orchestratorProvider.isResourceDiscoveryEnabled()
      ? routeLink(routeManager, "DiscoveredResources", isEnvPresent, {
          id: "Discovered Resources",
        })
      : []),
    ...routeLink(routeManager, "Agents", isEnvPresent),
    ...routeLink(routeManager, "Facts", isEnvPresent),
  ],
});
