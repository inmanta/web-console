import { RouteKind } from "@/Core";

type Paths = Record<RouteKind, string>;

export const paths: Paths = {
  /**
   * Main
   */
  Home: "/",
  CreateEnvironment: "/environment/create",
  Settings: "/settings",
  Status: "/status",
  NotificationCenter: "/notificationcenter",

  /**
   * LSM
   */
  Catalog: "/lsm/catalog",
  Inventory: "/lsm/catalog/:service/inventory",
  CreateInstance: "/lsm/catalog/:service/inventory/add",
  EditInstance: "/lsm/catalog/:service/inventory/:instance/edit",
  History: "/lsm/catalog/:service/inventory/:instance/history",
  Diagnose: "/lsm/catalog/:service/inventory/:instance/diagnose",
  Events: "/lsm/catalog/:service/inventory/:instance/events",

  /**
   * Resource Manager
   */
  Resources: "/resources",
  Agents: "/agents",
  Facts: "/facts",
  AgentProcess: "/agents/:id",
  ResourceDetails: "/resources/:resourceId",

  /**
   * Orchestration Engine
   */
  CompileReports: "/compilereports",
  CompileDetails: "/compilereports/:id",
  DesiredState: "/desiredstate",
  DesiredStateDetails: "/desiredstate/:version",
  DesiredStateResourceDetails: "/desiredstate/:version/resource/:resourceId",
  DesiredStateCompare: "/desiredstate/compare/:from/:to",
  Parameters: "/parameters",
  ComplianceCheck: "/desiredstate/:version/compliancecheck",
};
