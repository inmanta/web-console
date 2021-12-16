import { generatePath, matchPath, PathMatch } from "react-router-dom";
import {
  RouteDictionary,
  RouteManager,
  Route,
  RouteKind,
  RouteParams,
  RouteMatch,
} from "@/Core";
import { paths } from "./Paths";

export class PrimaryRouteManager implements RouteManager {
  private readonly routeDictionary: RouteDictionary;

  constructor(private readonly baseUrl: string) {
    this.routeDictionary = {
      Home: Home(this.baseUrl),
      CreateEnvironment: CreateEnvironment(this.baseUrl),
      Catalog: Catalog(this.baseUrl),
      Inventory: Inventory(this.baseUrl),
      CreateInstance: CreateInstance(this.baseUrl),
      EditInstance: EditInstance(this.baseUrl),
      History: History(this.baseUrl),
      Diagnose: Diagnose(this.baseUrl),
      Events: Events(this.baseUrl),
      Resources: Resources(this.baseUrl),
      Agents: Agents(this.baseUrl),
      AgentProcess: AgentProcess(this.baseUrl),
      CompileReports: CompileReports(this.baseUrl),
      CompileDetails: CompileDetails(this.baseUrl),
      ResourceDetails: ResourceDetails(this.baseUrl),
      Settings: Settings(this.baseUrl),
      Status: Status(this.baseUrl),
      DesiredState: DesiredState(this.baseUrl),
    };
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

  getRoute(kind: RouteKind): Route {
    return this.routeDictionary[kind];
  }

  getUrl(kind: RouteKind, params: RouteParams<RouteKind>): string {
    const route = this.getRoute(kind);
    return generatePath(route.path, params);
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
}

const Catalog = (base: string): Route => ({
  kind: "Catalog",
  parent: "Home",
  path: `${base}${paths.Catalog}`,
  label: "Service Catalog",
  environmentRole: "Required",
});

const Inventory = (base: string): Route => ({
  kind: "Inventory",
  parent: "Catalog",
  path: `${base}${paths.Inventory}`,
  label: "Service Inventory",
  environmentRole: "Required",
});

const CreateInstance = (base: string): Route => ({
  kind: "CreateInstance",
  parent: "Inventory",
  path: `${base}${paths.CreateInstance}`,
  label: "Create Instance",
  environmentRole: "Required",
});

const EditInstance = (base: string): Route => ({
  kind: "EditInstance",
  parent: "Inventory",
  path: `${base}${paths.EditInstance}`,
  label: "Edit Instance",
  environmentRole: "Required",
});

const History = (base: string): Route => ({
  kind: "History",
  parent: "Inventory",
  path: `${base}${paths.History}`,
  label: "Service Instance History",
  environmentRole: "Required",
});

const Diagnose = (base: string): Route => ({
  kind: "Diagnose",
  parent: "Inventory",
  path: `${base}${paths.Diagnose}`,
  label: "Diagnose Service Instance",
  environmentRole: "Required",
});

const Events = (base: string): Route => ({
  kind: "Events",
  parent: "Inventory",
  label: "Service Instance Events",
  path: `${base}${paths.Events}`,
  environmentRole: "Required",
});

const Resources = (base: string): Route => ({
  kind: "Resources",
  parent: "Home",
  path: `${base}${paths.Resources}`,
  label: "Resources",
  environmentRole: "Required",
});

const Agents = (base: string): Route => ({
  kind: "Agents",
  parent: "Home",
  path: `${base}${paths.Agents}`,
  label: "Agents",
  environmentRole: "Required",
});

const AgentProcess = (base: string): Route => ({
  kind: "AgentProcess",
  parent: "Agents",
  path: `${base}${paths.AgentProcess}`,
  label: "Agent Process",
  environmentRole: "Required",
});

const DesiredState = (base: string): Route => ({
  kind: "DesiredState",
  parent: "Home",
  path: `${base}${paths.DesiredState}`,
  label: "Desired State",
});

const CompileReports = (base: string): Route => ({
  kind: "CompileReports",
  parent: "Home",
  path: `${base}${paths.CompileReports}`,
  label: "Compile Reports",
  environmentRole: "Required",
});

const CompileDetails = (base: string): Route => ({
  kind: "CompileDetails",
  parent: "CompileReports",
  path: `${base}${paths.CompileDetails}`,
  label: "Compile Details",
  environmentRole: "Required",
});

const ResourceDetails = (base: string): Route => ({
  kind: "ResourceDetails",
  parent: "Resources",
  path: `${base}${paths.ResourceDetails}`,
  label: "Resource Details",
  environmentRole: "Required",
});

const Home = (base: string): Route => ({
  kind: "Home",
  path: `${base}${paths.Home}`,
  label: "Home",
  environmentRole: "Forbidden",
});

const CreateEnvironment = (base: string): Route => ({
  kind: "CreateEnvironment",
  parent: "Home",
  path: `${base}${paths.CreateEnvironment}`,
  label: "Create Environment",
  environmentRole: "Forbidden",
});

const Settings = (base: string): Route => ({
  kind: "Settings",
  parent: "Home",
  path: `${base}${paths.Settings}`,
  label: "Settings",
  environmentRole: "Required",
});

const Status = (base: string): Route => ({
  kind: "Status",
  parent: "Home",
  path: `${base}${paths.Status}`,
  label: "Status",
  environmentRole: "Optional",
});
