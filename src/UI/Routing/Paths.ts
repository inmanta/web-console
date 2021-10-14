import { Kind } from "./Kind";

type Paths = Record<Kind, string>;

export const paths: Paths = {
  Catalog: "/lsm/catalog",
  Inventory: "/lsm/catalog/:service/inventory",
  CreateInstance: "/lsm/catalog/:service/inventory/add",
  EditInstance: "/lsm/catalog/:service/inventory/:instance/edit",
  History: "/lsm/catalog/:service/inventory/:instance/history",
  Diagnose: "/lsm/catalog/:service/inventory/:instance/diagnose",
  Events: "/lsm/catalog/:service/inventory/:instance/events",
  Resources: "/resources",
  ResourceDetails: "/resources/:resourceId",
  CompileReports: "/compilereports",
  CompileDetails: "/compilereports/:id",
  Settings: "/settings",
  Home: "/",
};
