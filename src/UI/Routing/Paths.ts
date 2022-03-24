import { RouteKind } from "@/Core";
import { AgentProcess } from "@S/Agent";
import { Notification } from "@S/Notification";
import { Resource } from "@S/Resource";

type Paths = Record<RouteKind, string>;

export const paths: Paths = {
  /**
   * Main
   */
  Home: "/",
  CreateEnvironment: "/environment/create",
  Settings: "/settings",
  Status: "/status",
  NotificationCenter: Notification.path,

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
  Resources: Resource.path,
  Agents: "/agents",
  Facts: "/facts",
  AgentProcess: AgentProcess.path,
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
