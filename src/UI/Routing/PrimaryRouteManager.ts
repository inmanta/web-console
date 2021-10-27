import { RouteDictionary, RouteManager } from "@/Core";
import { Route } from "./Route";
import { paths } from "./Paths";

export class PrimaryRouteManager implements RouteManager {
  constructor(private readonly baseUrl: string) {}

  getRoutes(): Route[] {
    throw new Error("Method not implemented.");
  }
  getRouteDictionary(): RouteDictionary {
    return {
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

  getDashboardUrl(environment: string): string {
    return `${this.baseUrl.replace(
      "/console",
      "/dashboard"
    )}/#!/environment/${environment}`;
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
