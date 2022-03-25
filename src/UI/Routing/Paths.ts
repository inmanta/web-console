import { RouteKind } from "@/Core";
import { AgentProcess } from "@S/AgentProcess";
import { Agents } from "@S/Agents";
import { CompileDetails } from "@S/CompileDetails";
import { CompileReports } from "@S/CompileReports";
import { ComplianceCheck } from "@S/ComplianceCheck";
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
  Agents: Agents.path,
  Facts: "/facts",
  AgentProcess: AgentProcess.path,
  ResourceDetails: "/resources/:resourceId",

  /**
   * Orchestration Engine
   */
  CompileReports: CompileReports.path,
  CompileDetails: CompileDetails.path,
  DesiredState: "/desiredstate",
  DesiredStateDetails: "/desiredstate/:version",
  DesiredStateResourceDetails: "/desiredstate/:version/resource/:resourceId",
  DesiredStateCompare: "/desiredstate/compare/:from/:to",
  Parameters: "/parameters",
  ComplianceCheck: ComplianceCheck.path,
};
