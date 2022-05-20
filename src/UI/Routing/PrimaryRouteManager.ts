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
import { AgentProcess } from "@S/AgentProcess";
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
import { Parameters } from "@S/Parameters";
import { Resource } from "@S/Resource";
import { ResourceDetails } from "@S/ResourceDetails";
import { ServiceCatalog } from "@S/ServiceCatalog";
import { ServiceInstanceHistory } from "@S/ServiceInstanceHistory";
import { ServiceInventory } from "@S/ServiceInventory";
import { Settings } from "@S/Settings";
import { Status } from "@S/Status";
import { encodeParams } from "./Utils";

export class PrimaryRouteManager implements RouteManager {
  private readonly routeDictionary: RouteDictionary;

  constructor(private readonly baseUrl: string) {
    this.routeDictionary = {
      /**
       * Main
       */
      Home: Home.route(this.baseUrl),
      CreateEnvironment: CreateEnvironment.route(this.baseUrl),
      Settings: Settings.route(this.baseUrl),
      Status: Status.route(this.baseUrl),
      NotificationCenter: Notification.route(this.baseUrl),

      /**
       * LSM
       */
      Catalog: ServiceCatalog.route(this.baseUrl),
      Inventory: ServiceInventory.route(this.baseUrl),
      CreateInstance: CreateInstance.route(this.baseUrl),
      EditInstance: EditInstance.route(this.baseUrl),
      History: ServiceInstanceHistory.route(this.baseUrl),
      Diagnose: Diagnose.route(this.baseUrl),
      Events: Events.route(this.baseUrl),

      /**
       * Resource Manager
       */
      Resources: Resource.route(this.baseUrl),
      Agents: Agents.route(this.baseUrl),
      Facts: Facts.route(this.baseUrl),
      AgentProcess: AgentProcess.route(this.baseUrl),
      ResourceDetails: ResourceDetails.route(this.baseUrl),

      /**
       * Orchestration Engine
       */
      CompileReports: CompileReports.route(this.baseUrl),
      CompileDetails: CompileDetails.route(this.baseUrl),
      DesiredState: DesiredState.route(this.baseUrl),
      DesiredStateDetails: DesiredStateDetails.route(this.baseUrl),
      DesiredStateResourceDetails: DesiredStateResourceDetails.route(
        this.baseUrl
      ),
      DesiredStateCompare: DesiredStateCompare.route(this.baseUrl),
      Parameters: Parameters.route(this.baseUrl),
      ComplianceCheck: ComplianceCheck.route(this.baseUrl),
    };
  }

  isBaseUrlDefined(): boolean {
    return this.baseUrl !== "";
  }

  getLineageFromRoute(route: Route, routes: Route[] = []): Route[] {
    if (route.parent) {
      return this.getLineageFromRoute(this.getRoute(route.parent), [
        route,
        ...routes,
      ]);
    }
    return [route, ...routes];
  }

  getRelatedUrlWithoutParams(pathname: string): string {
    const routeMatch = this.getRouteMatchFromUrl(pathname);
    if (typeof routeMatch === "undefined") {
      return this.getUrl("Home", undefined);
    }
    const { route } = routeMatch;
    if (!this.routeHasParams(route)) return pathname;
    const parent = this.getParentWithoutParams(route);
    if (typeof parent === "undefined") return this.getUrl("Home", undefined);
    return this.getUrl(parent.kind, undefined);
  }

  private getParentWithoutParams(route: Route): Route | undefined {
    const lineage = this.getLineageFromRoute(route);
    return lineage.reverse().find((route) => !this.routeHasParams(route));
  }

  private routeHasParams(route: Route): boolean {
    return route.path.includes(":");
  }

  getRoutes(): Route[] {
    return Object.values(this.routeDictionary);
  }

  getRouteDictionary(): RouteDictionary {
    return this.routeDictionary;
  }

  getRoute<K extends RouteKind>(kind: K): Route<K> {
    return this.routeDictionary[kind] as Route<K>;
  }

  getUrl<K extends RouteKind>(kind: K, params: RouteParams<K>): string {
    const route = this.getRoute(kind);
    return generatePath(
      route.path,
      params === undefined ? params : encodeParams(params)
    );
  }

  getUrlForApiUri(uri: string): string | undefined {
    if (uri.length <= 0) return undefined;
    const pattern = "/api/v2/compilereport/:id";
    const match = matchPath(pattern, uri);
    if (match === null) return undefined;
    if (match.params.id === undefined) return undefined;
    return this.getUrl("CompileDetails", { id: match.params.id });
  }

  getUrlCompileDetailsId(
    uri: string
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

  getRouteMatchFromUrl(url: string): RouteMatch | undefined {
    const routeMatchPairs = this.getRoutes().map((route) => [
      route,
      matchPath(route.path, url),
    ]);
    const routeWithMatch = routeMatchPairs.find(
      (pair): pair is [Route, PathMatch] => pair[1] !== null
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

  useUrl(kind: RouteKind, params: RouteParams<RouteKind>): string {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { search } = useLocation();
    const route = this.getRoute(kind);
    const path = generatePath(
      route.path,
      params === undefined ? params : encodeParams(params)
    );
    return `${path}${search}`;
  }

  getCrumbs(url: string): Crumb[] {
    const routeMatch = this.getRouteMatchFromUrl(url);
    if (typeof routeMatch === "undefined") return [];
    const { route, params } = routeMatch;
    const lineage = this.getLineageFromRoute(route);
    return lineage.map(({ kind, generateLabel, path }, idx) => ({
      kind,
      label: generateLabel(params),
      url: generatePath(path, params),
      active: idx === lineage.length - 1,
    }));
  }
}
