import { BaseUrlFinder } from "./BaseUrlFinder";
import { paths } from "./Paths";
import { Kinds } from "./Kinds";

export const BASE_URL = new BaseUrlFinder().getUrl(location.pathname);

interface ParamsManifest {
  Catalog: undefined;
  Inventory: { service: string };
  CreateInstance: { service: string };
  EditInstance: { service: string; instance: string };
  History: { service: string; instance: string };
  Events: { service: string; instance: string };
  Diagnose: { service: string; instance: string };
  Resources: undefined;
  ResourceHistory: { resourceId: string };
  CompileReports: undefined;
  CompileDetails: { id: string };
  ResourceActions: { resourceId: string };
}

export type Params<R extends Kinds> = ParamsManifest[R];

export interface Route {
  kind: Kinds;
  parent?: Kinds;
  path: string;
  label: string;
}

export const Catalog: Route = {
  kind: "Catalog",
  path: `${BASE_URL}${paths.Catalog}`,
  label: "Service Catalog",
};

export const Inventory: Route = {
  kind: "Inventory",
  parent: "Catalog",
  path: `${BASE_URL}${paths.Inventory}`,
  label: "Service Inventory",
};

export const CreateInstance: Route = {
  kind: "CreateInstance",
  parent: "Inventory",
  path: `${BASE_URL}${paths.CreateInstance}`,
  label: "Create Instance",
};

export const EditInstance: Route = {
  kind: "EditInstance",
  parent: "Inventory",
  path: `${BASE_URL}${paths.EditInstance}`,
  label: "Edit Instance",
};

export const History: Route = {
  kind: "History",
  parent: "Inventory",
  path: `${BASE_URL}${paths.History}`,
  label: "Service Instance History",
};

export const Diagnose: Route = {
  kind: "Diagnose",
  parent: "Inventory",
  path: `${BASE_URL}${paths.Diagnose}`,
  label: "Diagnose Service Instance",
};

export const Events: Route = {
  kind: "Events",
  parent: "Inventory",
  label: "Service Instance Events",
  path: `${BASE_URL}${paths.Events}`,
};

export const Resources: Route = {
  kind: "Resources",
  path: `${BASE_URL}${paths.Resources}`,
  label: "Resources",
};

export const ResourceHistory: Route = {
  kind: "ResourceHistory",
  parent: "Resources",
  path: `${BASE_URL}${paths.ResourceHistory}`,
  label: "Resource History",
};

export const CompileReports: Route = {
  kind: "CompileReports",
  path: `${BASE_URL}${paths.CompileReports}`,
  label: "Compile Reports",
};

export const CompileDetails: Route = {
  kind: "CompileDetails",
  parent: "CompileReports",
  path: `${BASE_URL}${paths.CompileDetails}`,
  label: "Compile Details",
};

export const ResourceActions: Route = {
  kind: "ResourceActions",
  parent: "Resources",
  path: `${BASE_URL}${paths.ResourceActions}`,
  label: "Resource Actions",
};

export const allRoutes: Route[] = [
  Catalog,
  Inventory,
  CreateInstance,
  EditInstance,
  History,
  Diagnose,
  Events,
  Resources,
  ResourceHistory,
  CompileReports,
  CompileDetails,
  ResourceActions,
];

export const DashboardUrl = (environment: string): string =>
  `${BASE_URL.replace("/console", "/dashboard")}/#!/environment/${environment}`;

export const getRouteFromKind = (kind: Kinds): Route => {
  switch (kind) {
    case "Catalog":
      return Catalog;
    case "Inventory":
      return Inventory;
    case "History":
      return History;
    case "CreateInstance":
      return CreateInstance;
    case "EditInstance":
      return EditInstance;
    case "Diagnose":
      return Diagnose;
    case "Events":
      return Events;
    case "Resources":
      return Resources;
    case "ResourceHistory":
      return ResourceHistory;
    case "CompileReports":
      return CompileReports;
    case "CompileDetails":
      return CompileDetails;
    case "ResourceActions":
      return ResourceActions;
  }
};
