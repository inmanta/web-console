import { RouteKind } from "@/Core";

type Paths = Record<RouteKind, string>;

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
  Agents: "/agents",
  AgentProcess: "/agents/:id",
  CompileReports: "/compilereports",
  CompileDetails: "/compilereports/:id",
  Settings: "/settings",
  CreateEnvironment: "/environment/create",
  Status: "/status",
  DesiredState: "/desiredstate",
  DesiredStateDetails: "/desiredstate/:version",
  DesiredStateResourceDetails: "/desiredstate/:version/resource/:resourceId",
  Parameters: "/parameters",
  Home: "/",
};
