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
import { DuplicateInstance } from "@S/DuplicateInstance";
import { EditInstance } from "@S/EditInstance";
import { Events } from "@S/Events";
import { Facts } from "@S/Facts";
import { Home } from "@S/Home";
import { Notification } from "@S/Notification";
import { Parameters } from "@S/Parameters";
import { Resource } from "@S/Resource";
import { ResourceDetails } from "@S/ResourceDetails";
import { DiscoveredResources } from "@S/ResourceDiscovery";
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
  CreateEnvironment: CreateEnvironment.path,
  Home: Home.path,
  NotificationCenter: Notification.path,
  Settings: Settings.path,
  Status: Status.path,

  /**
   * LSM
   */
  Catalog: ServiceCatalog.path,
  CreateInstance: CreateInstance.path,
  Dashboard: Dashboard.path,
  Diagnose: Diagnose.path,
  DuplicateInstance: DuplicateInstance.path,
  EditInstance: EditInstance.path,
  Events: Events.path,
  History: ServiceInstanceHistory.path,
  InstanceComposer: InstanceComposer.path,
  InstanceComposerEditor: InstanceComposerEditor.path,
  Inventory: ServiceInventory.path,
  ServiceDetails: ServiceDetails.path,

  /**
   * Resource Manager
   */
  AgentProcess: AgentProcess.path,
  Agents: Agents.path,
  DiscoveredResources: DiscoveredResources.path,
  Facts: Facts.path,
  ResourceDetails: ResourceDetails.path,
  Resources: Resource.path,

  /**
   * Orchestration Engine
   */
  CompileDetails: CompileDetails.path,
  CompileReports: CompileReports.path,
  ComplianceCheck: ComplianceCheck.path,
  DesiredState: DesiredState.path,
  DesiredStateCompare: DesiredStateCompare.path,
  DesiredStateDetails: DesiredStateDetails.path,
  DesiredStateResourceDetails: DesiredStateResourceDetails.path,
  Parameters: Parameters.path,
};
