import { RouteKind } from "@/Core";
import { AgentProcess } from "@S/AgentProcess";
import { Agents } from "@S/Agents";
import { CompileDetails } from "@S/CompileDetails";
import { CompileReports } from "@S/CompileReports";
import { ComplianceCheck } from "@S/ComplianceCheck";
import { DesiredState } from "@S/DesiredState";
import { DesiredStateCompare } from "@S/DesiredStateCompare";
import { Diagnose } from "@S/Diagnose";
import { Events } from "@S/Events";
import { Facts } from "@S/Facts";
import { Notification } from "@S/Notification";
import { Parameters } from "@S/Parameters";
import { Resource } from "@S/Resource";
import { ResourceDetails } from "@S/ResourceDetails";
import { ServiceInstanceHistory } from "@S/ServiceInstanceHistory";
import { Settings } from "@S/Settings";

type Paths = Record<RouteKind, string>;

export const paths: Paths = {
  /**
   * Main
   */
  Home: "/",
  CreateEnvironment: "/environment/create",
  Settings: Settings.path,
  Status: "/status",
  NotificationCenter: Notification.path,

  /**
   * LSM
   */
  Catalog: "/lsm/catalog",
  Inventory: "/lsm/catalog/:service/inventory",
  CreateInstance: "/lsm/catalog/:service/inventory/add",
  EditInstance: "/lsm/catalog/:service/inventory/:instance/edit",
  History: ServiceInstanceHistory.path,
  Diagnose: Diagnose.path,
  Events: Events.path,

  /**
   * Resource Manager
   */
  Resources: Resource.path,
  Agents: Agents.path,
  Facts: Facts.path,
  AgentProcess: AgentProcess.path,
  ResourceDetails: ResourceDetails.path,

  /**
   * Orchestration Engine
   */
  CompileReports: CompileReports.path,
  CompileDetails: CompileDetails.path,
  DesiredState: DesiredState.path,
  DesiredStateDetails: "/desiredstate/:version",
  DesiredStateResourceDetails: "/desiredstate/:version/resource/:resourceId",
  DesiredStateCompare: DesiredStateCompare.path,
  Parameters: Parameters.path,
  ComplianceCheck: ComplianceCheck.path,
};
