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
} from "@/Core";
import { paths } from "./Paths";
import { encodeParams } from "./Utils";

export class PrimaryRouteManager implements RouteManager {
  private readonly routeDictionary: RouteDictionary;

  constructor(private readonly baseUrl: string) {
    this.routeDictionary = {
      /**
       * Main
       */
      Home: Home(this.baseUrl),
      CreateEnvironment: CreateEnvironment(this.baseUrl),
      Settings: Settings(this.baseUrl),
      Status: Status(this.baseUrl),
      NotificationCenter: NotificationCenter(this.baseUrl),

      /**
       * LSM
       */
      Catalog: Catalog(this.baseUrl),
      Inventory: Inventory(this.baseUrl),
      CreateInstance: CreateInstance(this.baseUrl),
      EditInstance: EditInstance(this.baseUrl),
      History: History(this.baseUrl),
      Diagnose: Diagnose(this.baseUrl),
      Events: Events(this.baseUrl),

      /**
       * Resource Manager
       */
      Resources: Resources(this.baseUrl),
      Agents: Agents(this.baseUrl),
      Facts: Facts(this.baseUrl),
      AgentProcess: AgentProcess(this.baseUrl),
      ResourceDetails: ResourceDetails(this.baseUrl),

      /**
       * Orchestration Engine
       */
      CompileReports: CompileReports(this.baseUrl),
      CompileDetails: CompileDetails(this.baseUrl),
      DesiredState: DesiredState(this.baseUrl),
      DesiredStateDetails: DesiredStateDetails(this.baseUrl),
      DesiredStateResourceDetails: DesiredStateResourceDetails(this.baseUrl),
      DesiredStateCompare: DesiredStateCompare(this.baseUrl),
      Parameters: Parameters(this.baseUrl),
      ComplianceCheck: ComplianceCheck(this.baseUrl),
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

const Catalog = (base: string): Route<"Catalog"> => ({
  kind: "Catalog",
  parent: "Home",
  path: `${base}${paths.Catalog}`,
  generateLabel: () => "Service Catalog",
  environmentRole: "Required",
});

const Inventory = (base: string): Route<"Inventory"> => ({
  kind: "Inventory",
  parent: "Catalog",
  path: `${base}${paths.Inventory}`,
  generateLabel: (params) => `Service Inventory: ${params.service}`,
  environmentRole: "Required",
});

const CreateInstance = (base: string): Route<"CreateInstance"> => ({
  kind: "CreateInstance",
  parent: "Inventory",
  path: `${base}${paths.CreateInstance}`,
  generateLabel: () => "Create Instance",
  environmentRole: "Required",
});

const EditInstance = (base: string): Route<"EditInstance"> => ({
  kind: "EditInstance",
  parent: "Inventory",
  path: `${base}${paths.EditInstance}`,
  generateLabel: () => "Edit Instance",
  environmentRole: "Required",
});

const History = (base: string): Route<"History"> => ({
  kind: "History",
  parent: "Inventory",
  path: `${base}${paths.History}`,
  generateLabel: () => "Service Instance History",
  environmentRole: "Required",
});

const Diagnose = (base: string): Route<"Diagnose"> => ({
  kind: "Diagnose",
  parent: "Inventory",
  path: `${base}${paths.Diagnose}`,
  generateLabel: () => "Diagnose Service Instance",
  environmentRole: "Required",
});

const Events = (base: string): Route<"Events"> => ({
  kind: "Events",
  parent: "Inventory",
  generateLabel: () => "Service Instance Events",
  path: `${base}${paths.Events}`,
  environmentRole: "Required",
});

const Resources = (base: string): Route<"Resources"> => ({
  kind: "Resources",
  parent: "Home",
  path: `${base}${paths.Resources}`,
  generateLabel: () => "Resources",
  environmentRole: "Required",
});

const Agents = (base: string): Route<"Agents"> => ({
  kind: "Agents",
  parent: "Home",
  path: `${base}${paths.Agents}`,
  generateLabel: () => "Agents",
  environmentRole: "Required",
});

const Facts = (base: string): Route<"Facts"> => ({
  kind: "Facts",
  parent: "Home",
  path: `${base}${paths.Facts}`,
  generateLabel: () => "Facts",
  environmentRole: "Required",
});

const AgentProcess = (base: string): Route<"AgentProcess"> => ({
  kind: "AgentProcess",
  parent: "Agents",
  path: `${base}${paths.AgentProcess}`,
  generateLabel: () => "Agent Process",
  environmentRole: "Required",
});

const DesiredState = (base: string): Route<"DesiredState"> => ({
  kind: "DesiredState",
  parent: "Home",
  path: `${base}${paths.DesiredState}`,
  generateLabel: () => "Desired State",
  environmentRole: "Required",
});

const DesiredStateDetails = (base: string): Route<"DesiredStateDetails"> => ({
  kind: "DesiredStateDetails",
  parent: "DesiredState",
  path: `${base}${paths.DesiredStateDetails}`,
  generateLabel: () => "Details",
  environmentRole: "Required",
});

const DesiredStateResourceDetails = (
  base: string
): Route<"DesiredStateResourceDetails"> => ({
  kind: "DesiredStateResourceDetails",
  parent: "DesiredStateDetails",
  path: `${base}${paths.DesiredStateResourceDetails}`,
  generateLabel: () => "Resource Details",
  environmentRole: "Required",
});

const DesiredStateCompare = (base: string): Route<"DesiredStateCompare"> => ({
  kind: "DesiredStateCompare",
  parent: "DesiredState",
  path: `${base}${paths.DesiredStateCompare}`,
  generateLabel: () => "Compare",
  environmentRole: "Required",
});

const CompileReports = (base: string): Route<"CompileReports"> => ({
  kind: "CompileReports",
  parent: "Home",
  path: `${base}${paths.CompileReports}`,
  generateLabel: () => "Compile Reports",
  environmentRole: "Required",
});

const CompileDetails = (base: string): Route<"CompileDetails"> => ({
  kind: "CompileDetails",
  parent: "CompileReports",
  path: `${base}${paths.CompileDetails}`,
  generateLabel: () => "Compile Details",
  environmentRole: "Required",
});

const ResourceDetails = (base: string): Route<"ResourceDetails"> => ({
  kind: "ResourceDetails",
  parent: "Resources",
  path: `${base}${paths.ResourceDetails}`,
  generateLabel: () => "Resource Details",
  environmentRole: "Required",
});

const Home = (base: string): Route<"Home"> => ({
  kind: "Home",
  path: `${base}${paths.Home}`,
  generateLabel: () => "Home",
  environmentRole: "Forbidden",
});

const CreateEnvironment = (base: string): Route<"CreateEnvironment"> => ({
  kind: "CreateEnvironment",
  parent: "Home",
  path: `${base}${paths.CreateEnvironment}`,
  generateLabel: () => "Create Environment",
  environmentRole: "Forbidden",
});

const Settings = (base: string): Route<"Settings"> => ({
  kind: "Settings",
  parent: "Home",
  path: `${base}${paths.Settings}`,
  generateLabel: () => "Settings",
  environmentRole: "Required",
});

const Status = (base: string): Route<"Status"> => ({
  kind: "Status",
  parent: "Home",
  path: `${base}${paths.Status}`,
  generateLabel: () => "Status",
  environmentRole: "Optional",
});

const Parameters = (base: string): Route<"Parameters"> => ({
  kind: "Parameters",
  parent: "Home",
  path: `${base}${paths.Parameters}`,
  generateLabel: () => "Parameters",
  environmentRole: "Required",
});

const ComplianceCheck = (base: string): Route<"ComplianceCheck"> => ({
  kind: "ComplianceCheck",
  parent: "DesiredState",
  path: `${base}${paths.ComplianceCheck}`,
  generateLabel: () => "Compliance Check",
  environmentRole: "Required",
});

const NotificationCenter = (base: string): Route => ({
  kind: "NotificationCenter",
  parent: "Home",
  path: `${base}${paths.NotificationCenter}`,
  generateLabel: () => "Notification Center",
  environmentRole: "Required",
});
