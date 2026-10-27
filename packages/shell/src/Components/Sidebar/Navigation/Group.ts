import {
  FeatureModule,
  NAVIGATION_GROUPS,
  NavigationEntry,
  OrchestratorProvider,
  RouteManager,
  words,
} from "@inmanta/web-console-core";
import { SidebarLink, SidebarOptions } from "../../../ShellOptions";

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
 * Returns the sidebar link of a link the app adds itself. It opens in a new tab.
 *
 * @param {SidebarLink} link - the link the app adds
 * @returns Link
 */
const appLink = ({ label, href }: SidebarLink): Link => ({
  id: href,
  label,
  url: href,
  external: true,
  locked: false,
  statusIndication: false,
});

/**
 * Returns the groups of the sidebar, with the links the features add to them.
 * A feature whose licensed feature is not enabled adds no links, and empty groups are left out.
 *
 * @param {FeatureModule[]} features - the features the app ships
 * @param {RouteManager} routeManager
 * @param {OrchestratorProvider} orchestratorProvider
 * @param {boolean} isEnvPresent
 * @param {SidebarOptions} sidebar - how the app arranges the sidebar
 * @returns Group[]
 */
export const getGroups = (
  features: FeatureModule[],
  routeManager: RouteManager,
  orchestratorProvider: OrchestratorProvider,
  isEnvPresent: boolean,
  { order = [], hide = [], links = [] }: SidebarOptions = {}
): Group[] => {
  const entries = features
    .filter(
      ({ licensedFeature }) =>
        licensedFeature === undefined ||
        orchestratorProvider.isLicencedFeatureEnabled(licensedFeature)
    )
    .flatMap(({ navigation = [] }) => navigation)
    .filter(({ isVisible }) => isVisible === undefined || isVisible(orchestratorProvider))
    .filter(({ kind }) => !hide.includes(kind));
  const groupOrder = [...order, ...NAVIGATION_GROUPS.filter((group) => !order.includes(group))];

  return groupOrder
    .map((group) => ({
      id: group,
      title: words(`navigation.${group}`),
      links: [
        ...entries
          .filter((entry) => entry.group === group)
          .flatMap((entry) => routeLink(routeManager, entry, isEnvPresent)),
        ...links.filter((link) => link.group === group).map(appLink),
      ],
    }))
    .filter(({ links }) => links.length > 0);
};
