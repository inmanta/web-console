export type Kinds =
  | "Catalog"
  | "Inventory"
  | "CreateInstance"
  | "History"
  | "Diagnose"
  | "Events"
  | "Resources";

interface ParamsManifest {
  Catalog: undefined;
  Inventory: { service: string };
  CreateInstance: { service: string };
  History: { service: string; instance: string };
  Events: { service: string; instance: string };
  Diagnose: { service: string; instance: string };
  Resources: undefined;
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
  path: "/lsm/catalog",
  label: "Service Catalog",
};

export const Inventory: Route = {
  kind: "Inventory",
  parent: "Catalog",
  path: "/lsm/catalog/:service/inventory",
  label: "Service Inventory",
};

export const CreateInstance: Route = {
  kind: "CreateInstance",
  parent: "Inventory",
  path: "/lsm/catalog/:service/inventory/add",
  label: "Create Instance",
};

export const History: Route = {
  kind: "History",
  parent: "Inventory",
  path: "/lsm/catalog/:service/inventory/:instance/history",
  label: "Service Instance History",
};

export const Diagnose: Route = {
  kind: "Diagnose",
  parent: "Inventory",
  path: "/lsm/catalog/:service/inventory/:instance/diagnose",
  label: "Diagnose Service Instance",
};

export const Events: Route = {
  kind: "Events",
  parent: "Inventory",
  label: "Service Instance Events",
  path: "/lsm/catalog/:service/inventory/:instance/events",
};

export const Resources: Route = {
  kind: "Resources",
  path: "/resources",
  label: "Resources",
};

export const allRoutes: Route[] = [
  Catalog,
  Inventory,
  CreateInstance,
  History,
  Diagnose,
  Events,
  Resources,
];

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
    case "Diagnose":
      return Diagnose;
    case "Events":
      return Events;
    case "Resources":
      return Resources;
  }
};
