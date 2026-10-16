import {
  FeatureModule,
  NAVIGATION_GROUPS,
  NavigationEntry,
  OrchestratorProvider,
  RouteManager,
} from "@/Core";
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
 * Returns the sidebar link of a navigation entry, as a list to spread into a group.
 * The list is empty when the route is not registered, so the link is left out instead of broken.
 *
 * @param {RouteManager} routeManager
 * @param {NavigationEntry} entry - the navigation entry to link to
 * @param {boolean} isEnvPresent
 * @returns Link[]
 */
const routeLink = (
  routeManager: RouteManager,
  { kind, statusIndication = false }: NavigationEntry,
  isEnvPresent: boolean
): Link[] => {
  if (!routeManager.has(kind)) {
    return [];
  }

  const route = routeManager.getRoute(kind);

  return [
    {
      id: kind,
      label: route.generateLabel(undefined),
      url: route.path,
      external: false,
      locked: !isEnvPresent,
      statusIndication,
    },
  ];
};

/**
 * Returns the groups of the sidebar, with the links the features add to them.
 * A feature whose licensed feature is not enabled adds no links, and empty groups are left out.
 *
 * @param {FeatureModule[]} features - the features the app ships
 * @param {RouteManager} routeManager
 * @param {OrchestratorProvider} orchestratorProvider
 * @param {boolean} isEnvPresent
 * @returns Group[]
 */
export const getGroups = (
  features: FeatureModule[],
  routeManager: RouteManager,
  orchestratorProvider: OrchestratorProvider,
  isEnvPresent: boolean
): Group[] => {
  const entries = features
    .filter(
      ({ licenseFeature }) =>
        licenseFeature === undefined ||
        orchestratorProvider.isLicencedFeatureEnabled(licenseFeature)
    )
    .flatMap(({ navigation = [] }) => navigation)
    .filter(({ isVisible }) => isVisible === undefined || isVisible(orchestratorProvider));

  return NAVIGATION_GROUPS.map((group) => ({
    id: group,
    title: words(`navigation.${group}`),
    links: entries
      .filter((entry) => entry.group === group)
      .flatMap((entry) => routeLink(routeManager, entry, isEnvPresent)),
  })).filter(({ links }) => links.length > 0);
};
