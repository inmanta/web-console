import { generatePath } from "react-router-dom";
import {
  RouteDictionary,
  RouteManager,
  Route,
  RouteKind,
  RouteParams,
} from "@/Core";
import { paths } from "./Paths";
import { getRouteWithParamsFromUrl, getLineageFromRoute } from "./Utils";

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
      CompileReports: CompileReports(this.baseUrl),
      CompileDetails: CompileDetails(this.baseUrl),
      ResourceDetails: ResourceDetails(this.baseUrl),
      Settings: Settings(this.baseUrl),
    };
  }

  getRelatedUrlWithoutParams(url: string): string {
    const routeAndParams = getRouteWithParamsFromUrl(this.getRoutes(), url);
    if (typeof routeAndParams === "undefined") {
      return this.getUrl("Home", undefined);
    }
    const [currentRoute] = routeAndParams;
    if (!this.routeHasParams(currentRoute)) return url;
    const parent = this.getParentWithoutParams(currentRoute);
    if (typeof parent === "undefined") return this.getUrl("Home", undefined);
    return this.getUrl(parent.kind, undefined);
  }

  private getParentWithoutParams(route: Route): Route | undefined {
    const lineage = getLineageFromRoute(this, route);
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
    switch (kind) {
      case "Catalog":
        return this.routeDictionary.Catalog;
      case "Inventory":
        return this.routeDictionary.Inventory;
      case "History":
        return this.routeDictionary.History;
      case "CreateInstance":
        return this.routeDictionary.CreateInstance;
      case "EditInstance":
        return this.routeDictionary.EditInstance;
      case "Diagnose":
        return this.routeDictionary.Diagnose;
      case "Events":
        return this.routeDictionary.Events;
      case "Resources":
        return this.routeDictionary.Resources;
      case "CompileReports":
        return this.routeDictionary.CompileReports;
      case "CompileDetails":
        return this.routeDictionary.CompileDetails;
      case "Home":
        return this.routeDictionary.Home;
      case "ResourceDetails":
        return this.routeDictionary.ResourceDetails;
      case "Settings":
        return this.routeDictionary.Settings;
      case "CreateEnvironment":
        return this.routeDictionary.CreateEnvironment;
    }
  }

  getUrl(kind: RouteKind, params: RouteParams<typeof kind>): string {
    const route = this.getRoute(kind);
    return generatePath(route.path, params);
  }
}

const Catalog = (base: string): Route => ({
  kind: "Catalog",
  parent: "Home",
  path: `${base}${paths.Catalog}`,
  label: "Service Catalog",
});

const Inventory = (base: string): Route => ({
  kind: "Inventory",
  parent: "Catalog",
  path: `${base}${paths.Inventory}`,
  label: "Service Inventory",
});

const CreateInstance = (base: string): Route => ({
  kind: "CreateInstance",
  parent: "Inventory",
  path: `${base}${paths.CreateInstance}`,
  label: "Create Instance",
});

const EditInstance = (base: string): Route => ({
  kind: "EditInstance",
  parent: "Inventory",
  path: `${base}${paths.EditInstance}`,
  label: "Edit Instance",
});

const History = (base: string): Route => ({
  kind: "History",
  parent: "Inventory",
  path: `${base}${paths.History}`,
  label: "Service Instance History",
});

const Diagnose = (base: string): Route => ({
  kind: "Diagnose",
  parent: "Inventory",
  path: `${base}${paths.Diagnose}`,
  label: "Diagnose Service Instance",
});

const Events = (base: string): Route => ({
  kind: "Events",
  parent: "Inventory",
  label: "Service Instance Events",
  path: `${base}${paths.Events}`,
});

const Resources = (base: string): Route => ({
  kind: "Resources",
  parent: "Home",
  path: `${base}${paths.Resources}`,
  label: "Resources",
});

const CompileReports = (base: string): Route => ({
  kind: "CompileReports",
  parent: "Home",
  path: `${base}${paths.CompileReports}`,
  label: "Compile Reports",
});

const CompileDetails = (base: string): Route => ({
  kind: "CompileDetails",
  parent: "CompileReports",
  path: `${base}${paths.CompileDetails}`,
  label: "Compile Details",
});

const ResourceDetails = (base: string): Route => ({
  kind: "ResourceDetails",
  parent: "Resources",
  path: `${base}${paths.ResourceDetails}`,
  label: "Resource Details",
});

const Home = (base: string): Route => ({
  kind: "Home",
  path: `${base}${paths.Home}`,
  label: "Home",
  clearEnv: true,
});

const CreateEnvironment = (base: string): Route => ({
  kind: "CreateEnvironment",
  parent: "Home",
  path: `${base}${paths.CreateEnvironment}`,
  label: "Create Environment",
  clearEnv: true,
});

const Settings = (base: string): Route => ({
  kind: "Settings",
  parent: "Home",
  path: `${base}${paths.Settings}`,
  label: "Settings",
});
