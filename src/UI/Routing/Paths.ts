import { Kinds } from "./Kinds";

type Paths = Record<Kinds, string>;

export const paths: Paths = {
  Catalog: "/lsm/catalog",
  Inventory: "/lsm/catalog/:service/inventory",
  CreateInstance: "/lsm/catalog/:service/inventory/add",
  History: "/lsm/catalog/:service/inventory/:instance/history",
  Diagnose: "/lsm/catalog/:service/inventory/:instance/diagnose",
  Events: "/lsm/catalog/:service/inventory/:instance/events",
  Resources: "/resources",
  ResourceHistory: "/resources/:resourceId/history",
};
