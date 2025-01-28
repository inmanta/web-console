import {
  generatePath,
  matchPath,
  PathMatch,
  useLocation,
} from "react-router-dom";
import {
  RouteDictionary,
  RouteManager,
  Route,
  RouteKind,
  RouteParams,
  RouteMatch,
  Crumb,
  RouteKindWithId,
} from "@/Core";
import { Dashboard } from "@/Slices/Dashboard";
import { DuplicateInstance } from "@/Slices/DuplicateInstance";
import { InstanceComposer } from "@/Slices/InstanceComposerCreator";
import { InstanceComposerEditor } from "@/Slices/InstanceComposerEditor";
import { InstanceComposerViewer } from "@/Slices/InstanceComposerViewer";
import { ServiceDetails } from "@/Slices/ServiceDetails";
import { InstanceDetails } from "@/Slices/ServiceInstanceDetails";
import { Agents } from "@S/Agents";
import { CompileDetails } from "@S/CompileDetails";
import { CompileReports } from "@S/CompileReports";
import { ComplianceCheck } from "@S/ComplianceCheck";
import { CreateEnvironment } from "@S/CreateEnvironment";
import { CreateInstance } from "@S/CreateInstance";
import { DesiredState } from "@S/DesiredState";
import { DesiredStateCompare } from "@S/DesiredStateCompare";
import { DesiredStateDetails } from "@S/DesiredStateDetails";
import { DesiredStateResourceDetails } from "@S/DesiredStateResourceDetails";
import { Diagnose } from "@S/Diagnose";
import { EditInstance } from "@S/EditInstance";
import { Events } from "@S/Events";
import { Facts } from "@S/Facts";
import { Home } from "@S/Home";
import { Notification } from "@S/Notification";
import { OrderDetails } from "@S/OrderDetails";
import { Orders } from "@S/Orders";
import { Parameters } from "@S/Parameters";
import { Resource } from "@S/Resource";
import { ResourceDetails } from "@S/ResourceDetails";
import { DiscoveredResources } from "@S/ResourceDiscovery";
import { ServiceCatalog } from "@S/ServiceCatalog";
import { ServiceInventory } from "@S/ServiceInventory";
import { Settings } from "@S/Settings";
import { Status } from "@S/Status";
import { UserManagement } from "@S/UserManagement";
import { encodeParams } from "./Utils";

export function PrimaryRouteManager(baseUrl: string): RouteManager {
  const routeDictionary: RouteDictionary = {
    /**
     * Main
     */
    CreateEnvironment: CreateEnvironment.route(baseUrl),
    Home: Home.route(baseUrl),
    NotificationCenter: Notification.route(baseUrl),
    Settings: Settings.route(baseUrl),
    Status: Status.route(baseUrl),
    UserManagement: UserManagement.route(baseUrl),

    /**
     * LSM
     */
    Catalog: ServiceCatalog.route(baseUrl),
    CreateInstance: CreateInstance.route(baseUrl),
    Dashboard: Dashboard.route(baseUrl),
    Diagnose: Diagnose.route(baseUrl),
    DuplicateInstance: DuplicateInstance.route(baseUrl),
    EditInstance: EditInstance.route(baseUrl),
    Events: Events.route(baseUrl),
    InstanceDetails: InstanceDetails.route(baseUrl),
    InstanceComposer: InstanceComposer.route(baseUrl),
    InstanceComposerEditor: InstanceComposerEditor.route(baseUrl),
    InstanceComposerViewer: InstanceComposerViewer.route(baseUrl),
    Inventory: ServiceInventory.route(baseUrl),
    ServiceDetails: ServiceDetails.route(baseUrl),
    Orders: Orders.route(baseUrl),
    OrderDetails: OrderDetails.route(baseUrl),

    /**
     * Resource Manager
     */
    Agents: Agents.route(baseUrl),
    DiscoveredResources: DiscoveredResources.route(baseUrl),
    Facts: Facts.route(baseUrl),
    ResourceDetails: ResourceDetails.route(baseUrl),
    Resources: Resource.route(baseUrl),

    /**
     * Orchestration Engine
     */
    CompileDetails: CompileDetails.route(baseUrl),
    CompileReports: CompileReports.route(baseUrl),
    ComplianceCheck: ComplianceCheck.route(baseUrl),
    DesiredState: DesiredState.route(baseUrl),
    DesiredStateCompare: DesiredStateCompare.route(baseUrl),
    DesiredStateDetails: DesiredStateDetails.route(baseUrl),
    DesiredStateResourceDetails: DesiredStateResourceDetails.route(baseUrl),
    Parameters: Parameters.route(baseUrl),
  };

  function isBaseUrlDefined(): boolean {
    return baseUrl !== "";
  }

  function getLineageFromRoute(route: Route, routes: Route[] = []): Route[] {
    if (route.parent) {
      return getLineageFromRoute(getRoute(route.parent), [route, ...routes]);
    }

    return [route, ...routes];
  }

  function getRelatedUrlWithoutParams(pathname: string): string {
    const routeMatch = getRouteMatchFromUrl(pathname);

    if (typeof routeMatch === "undefined") {
      return getUrl("Home", undefined);
    }
    const { route } = routeMatch;

    if (!routeHasParams(route)) return pathname;
    const parent = getParentWithoutParams(route);

    if (typeof parent === "undefined") return getUrl("Home", undefined);

    return getUrl(parent.kind, undefined);
  }

  function getParentWithoutParams(route: Route): Route | undefined {
    const lineage = getLineageFromRoute(route);

    return lineage.reverse().find((route) => !routeHasParams(route));
  }

  function routeHasParams(route: Route): boolean {
    return route.path.includes(":");
  }

  function getRoutes(): Route[] {
    return Object.values(routeDictionary);
  }

  function getRouteDictionary(): RouteDictionary {
    return routeDictionary;
  }

  function getRoute<K extends RouteKind>(kind: K): Route<K> {
    return routeDictionary[kind] as Route<K>;
  }

  function getUrl<K extends RouteKind>(
    kind: K,
    params: RouteParams<K>,
  ): string {
    const route = getRoute(kind);

    return generatePath(
      route.path,
      params === undefined ? params : encodeParams(params),
    );
  }

  function getUrlForApiUri(uri: string): string | undefined {
    if (uri.length <= 0) return undefined;
    const pattern = "/api/v2/compilereport/:id";
    const match = matchPath(pattern, uri);

    if (match === null) return undefined;
    if (match.params.id === undefined) return undefined;

    return getUrl("CompileDetails", { id: match.params.id });
  }

  function getParamsFromUrl(
    uri: string,
  ): RouteKindWithId<"CompileDetails"> | undefined {
    if (uri.length <= 0) return undefined;
    const pattern = "/api/v2/compilereport/:id";
    const match = matchPath(pattern, uri);

    if (match === null) return undefined;
    if (match.params.id === undefined) return undefined;
    const params = { id: match.params.id };

    return {
      kind: "CompileDetails",
      params,
    };
  }

  function getRouteMatchFromUrl(url: string): RouteMatch | undefined {
    const routeMatchPairs = getRoutes().map((route) => [
      route,
      matchPath(route.path, url),
    ]);
    const routeWithMatch = routeMatchPairs.find(
      (pair): pair is [Route, PathMatch] => pair[1] !== null,
    );

    if (typeof routeWithMatch === "undefined") return undefined;
    const [route, match] = routeWithMatch;

    return {
      route,
      params:
        Object.entries(match.params).length <= 0
          ? undefined
          : (match.params as RouteParams<typeof route.kind>),
    };
  }

  function useUrl(kind: RouteKind, params: RouteParams<RouteKind>): string {
    const { search } = useLocation();
    const route = getRoute(kind);
    const path = generatePath(
      route.path,
      params === undefined ? params : encodeParams(params),
    );

    return `${path}${search}`;
  }

  function getCrumbs(url: string): Crumb[] {
    const routeMatch = getRouteMatchFromUrl(url);

    if (typeof routeMatch === "undefined") return [];
    const { route, params } = routeMatch;
    const lineage = getLineageFromRoute(route);

    return lineage.map(({ kind, generateLabel, path }, idx) => ({
      kind,
      label: generateLabel(params),
      url: generatePath(path, params),
      active: idx === lineage.length - 1,
    }));
  }

  return {
    isBaseUrlDefined,
    getRoutes,
    getRouteDictionary,
    getRoute,
    getUrl,
    getUrlForApiUri,
    getRelatedUrlWithoutParams,
    getLineageFromRoute,
    getRouteMatchFromUrl,
    useUrl: useUrl,
    getCrumbs,
    getParamsFromUrl,
  };
}
