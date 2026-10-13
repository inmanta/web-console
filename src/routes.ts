import { RouteFactory } from "@/Core";
import * as Agents from "@S/Agents/Core/Route";
import * as CompileDetails from "@S/CompileDetails/Core/Route";
import * as CompileReports from "@S/CompileReports/Core/Route";
import * as ComplianceCheck from "@S/ComplianceCheck/Core/Route";
import * as CreateEnvironment from "@S/CreateEnvironment/Core/Route";
import * as CreateInstance from "@S/CreateInstance/Core/Route";
import * as Dashboard from "@S/Dashboard/Core/Route";
import * as DesiredState from "@S/DesiredState/Core/Route";
import * as DesiredStateCompare from "@S/DesiredStateCompare/Core/Route";
import * as DesiredStateDetails from "@S/DesiredStateDetails/Core/Route";
import * as DesiredStateResourceDetails from "@S/DesiredStateResourceDetails/Core/Route";
import * as Diagnose from "@S/Diagnose/Core/Route";
import * as DuplicateInstance from "@S/DuplicateInstance/Core/Route";
import * as EditInstance from "@S/EditInstance/Core/Route";
import * as Events from "@S/Events/Core/Route";
import * as Facts from "@S/Facts/Core/Route";
import * as GraphiQL from "@S/GraphiQL/Core/Route";
import * as InstanceComposer from "@S/InstanceComposerCreator/Core/Route";
import * as InstanceComposerEditor from "@S/InstanceComposerEditor/Core/Route";
import * as InstanceComposerViewer from "@S/InstanceComposerViewer/Core/Route";
import * as MarkdownPreviewer from "@S/MarkdownPreviewer/Core/Route";
import * as Notification from "@S/Notification/Core/Route";
import * as OrderDetails from "@S/OrderDetails/Core/Route";
import * as Orders from "@S/Orders/Core/Route";
import * as Parameters from "@S/Parameters/Core/Route";
import * as Resource from "@S/Resource/Core/Route";
import * as ResourceDetails from "@S/ResourceDetails/Core/Route";
import * as DiscoveredResources from "@S/ResourceDiscovery/Core/Route";
import * as DiscoveredResourceDetails from "@S/ResourceDiscoveryDetails/Core/Route";
import * as ServiceCatalog from "@S/ServiceCatalog/Core/Route";
import * as ServiceDetails from "@S/ServiceDetails/Core/Route";
import * as InstanceDetails from "@S/ServiceInstanceDetails/Core/Route";
import * as ServiceInventory from "@S/ServiceInventory/Core/Route";
import * as Settings from "@S/Settings/Core/Route";
import * as Status from "@S/Status/Core/Route";
import * as UserManagement from "@S/UserManagement/Core/Route";

/**
 * The routes this app registers. The route table, pages and links only know these routes, so a
 * feature whose routes are left out is absent from the app.
 *
 * Order matters: a url resolves to the first route whose path matches it.
 */
export const routes: RouteFactory[] = [
  /**
   * Main
   */
  CreateEnvironment.route,
  GraphiQL.route,
  Notification.route,
  Settings.route,
  Status.route,
  UserManagement.route,

  /**
   * LSM
   */
  ServiceCatalog.route,
  CreateInstance.route,
  Dashboard.route,
  Diagnose.route,
  DuplicateInstance.route,
  EditInstance.route,
  Events.route,
  InstanceDetails.route,
  InstanceComposer.route,
  InstanceComposerEditor.route,
  InstanceComposerViewer.route,
  ServiceInventory.route,
  MarkdownPreviewer.route,
  ServiceDetails.route,
  Orders.route,
  OrderDetails.route,

  /**
   * Resource Manager
   */
  Agents.route,
  DiscoveredResources.route,
  DiscoveredResourceDetails.route,
  Facts.route,
  ResourceDetails.route,
  Resource.route,

  /**
   * Orchestration Engine
   */
  CompileDetails.route,
  CompileReports.route,
  ComplianceCheck.route,
  DesiredState.route,
  DesiredStateCompare.route,
  DesiredStateDetails.route,
  DesiredStateResourceDetails.route,
  Parameters.route,
];
