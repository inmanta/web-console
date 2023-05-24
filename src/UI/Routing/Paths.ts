import { RouteKind } from "@/Core";
import { Dashboard } from "@/Slices/Dashboard";
import { InstanceComposer } from "@/Slices/InstanceComposer";
import { InstanceComposerEditor } from "@/Slices/InstanceComposerEditor";
import { AgentProcess } from "@S/AgentProcess";
import { Agents } from "@S/Agents";
import { CompileDetails } from "@S/CompileDetails";
import { CompileReports } from "@S/CompileReports";
import { ComplianceCheck } from "@S/ComplianceCheck";
import { CreateEnvironment } from "@S/CreateEnvironment";
import { CreateInstance } from "@S/CreateInstance";
import { DesiredState } from "@S/DesiredState";
import { DesiredStateCompare } from "@S/DesiredStateCompare";
import { DesiredStateDetails } from "@S/DesiredStateDetails";
import { DesiredStateResourceDetails } from "@S/DesiredStateResourceDetails";
import { Diagnose } from "@S/Diagnose";
import { EditInstance } from "@S/EditInstance";
import { Events } from "@S/Events";
import { Facts } from "@S/Facts";
import { Home } from "@S/Home";
import { Notification } from "@S/Notification";
import { Parameters } from "@S/Parameters";
import { Resource } from "@S/Resource";
import { ResourceDetails } from "@S/ResourceDetails";
import { ServiceCatalog } from "@S/ServiceCatalog";
import { ServiceDetails } from "@S/ServiceDetails";
import { ServiceInstanceHistory } from "@S/ServiceInstanceHistory";
import { ServiceInventory } from "@S/ServiceInventory";
import { Settings } from "@S/Settings";
import { Status } from "@S/Status";

type Paths = Record<RouteKind, string>;

export const paths: Paths = {
  /**
   * Main
   */
  Home: Home.path,
  CreateEnvironment: CreateEnvironment.path,
  Settings: Settings.path,
  Status: Status.path,
  NotificationCenter: Notification.path,

  /**
   * LSM
   */
  Dashboard: Dashboard.path,
  Catalog: ServiceCatalog.path,
  InstanceComposer: InstanceComposer.path,
  InstanceComposerEditor: InstanceComposerEditor.path,
  Inventory: ServiceInventory.path,
  ServiceDetails: ServiceDetails.path,
  CreateInstance: CreateInstance.path,
  EditInstance: EditInstance.path,
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
  DesiredStateDetails: DesiredStateDetails.path,
  DesiredStateResourceDetails: DesiredStateResourceDetails.path,
  DesiredStateCompare: DesiredStateCompare.path,
  Parameters: Parameters.path,
  ComplianceCheck: ComplianceCheck.path,
};
