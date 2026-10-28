import {
  FeatureModule,
  NAVIGATION_GROUPS,
  NavigationEntry,
  OrchestratorProvider,
  RouteManager,
  words,
} from "@inmanta/web-console-core";
import { AppLink, SidebarOptions } from "@inmanta/web-console-shell/ShellOptions";

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
 * @param {AppLink} appLink - the link the app adds
 * @returns Link
 */
const createAppLink = ({ label, href }: AppLink): Link => ({
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
 * The sidebar options of the app set the group order, leave out its hidden entries and add its
 * app links after the feature entries of their group, so a group with only app links still shows.
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
  { groupOrder = [], hiddenEntries = [], appLinks = [] }: SidebarOptions = {}
): Group[] => {
  const entries = features
    .filter(
      ({ licensedFeature }) =>
        licensedFeature === undefined ||
        orchestratorProvider.isLicencedFeatureEnabled(licensedFeature)
    )
    .flatMap(({ navigation = [] }) => navigation)
    .filter(({ isVisible }) => isVisible === undefined || isVisible(orchestratorProvider))
    .filter(({ kind }) => !hiddenEntries.includes(kind));

  return [...new Set([...groupOrder, ...NAVIGATION_GROUPS])]
    .map((group) => ({
      id: group,
      title: words(`navigation.${group}`),
      links: [
        ...entries
          .filter((entry) => entry.group === group)
          .flatMap((entry) => routeLink(routeManager, entry, isEnvPresent)),
        ...appLinks.filter((appLink) => appLink.group === group).map(createAppLink),
      ],
    }))
    .filter(({ links }) => links.length > 0);
};
