import React, { lazy, ReactElement, Suspense } from "react";
import { PageManager, Page, Route, RouteKind } from "@/Core";
import { MarkdownPreviewerPage } from "@/Slices/MarkdownPreviewer/UI";
import { OrderDetailsPage } from "@/Slices/OrderDetails/UI";
import { OrdersPage } from "@/Slices/Orders/UI";
import { DiscoveredResourcesPage } from "@/Slices/ResourceDiscovery/UI";
import { DiscoveredResourceDetailsPage } from "@/Slices/ResourceDiscoveryDetails/UI";
import { ServiceDetailsPage } from "@/Slices/ServiceDetails/UI";
import { ServiceInstanceDetailsPage } from "@/Slices/ServiceInstanceDetails/UI";
import { UserManagementPage } from "@/Slices/UserManagement/UI/Page";
import { LoadingView } from "@/UI/Components/LoadingView";
import { AgentsPage } from "@S/Agents/UI";
import { CompileDetailsPage } from "@S/CompileDetails/UI";
import { CompileReportsPage } from "@S/CompileReports/UI";
import { ComplianceCheckPage } from "@S/ComplianceCheck/UI";
import { CreateEnvironmentPage } from "@S/CreateEnvironment/UI";
import { CreateInstancePage } from "@S/CreateInstance/UI";
import { DashboardPage } from "@S/Dashboard/UI";
import { DesiredStatePage } from "@S/DesiredState/UI";
import { DesiredStateComparePage } from "@S/DesiredStateCompare/UI";
import { DesiredStateDetailsPage } from "@S/DesiredStateDetails/UI";
import { DesiredStateResourceDetailsPage } from "@S/DesiredStateResourceDetails/UI";
import { DiagnosePage } from "@S/Diagnose/UI";
import { DuplicateInstancePage } from "@S/DuplicateInstance/UI";
import { EditInstancePage } from "@S/EditInstance/UI";
import { EventsPage } from "@S/Events/UI";
import { FactsPage } from "@S/Facts/UI";
import { GraphiQLPage } from "@S/GraphiQL/UI";
import { NotificationCenterPage } from "@S/Notification/UI/Center";
import { ParametersPage } from "@S/Parameters/UI";
import { ResourcesPage } from "@S/Resource/UI/ResourcesPage";
import { ResourceDetailsPage } from "@S/ResourceDetails/UI";
import { ServiceCatalogPage } from "@S/ServiceCatalog/UI";
import { ServiceInventoryPage } from "@S/ServiceInventory/UI";
import { SettingsPage } from "@S/Settings/UI";
import { StatusPage } from "@S/Status/UI";

// The instance composer pages pull in @joint/plus (~530 KB) and its supporting
// code. Load them lazily so that heavy chunk is fetched only when a composer
// route is opened, instead of on the initial load of every page.
const InstanceComposerPage = lazy(() =>
  import("@/Slices/InstanceComposerCreator/UI").then((module) => ({
    default: module.InstanceComposerPage,
  }))
);
const InstanceComposerEditorPage = lazy(() =>
  import("@/Slices/InstanceComposerEditor/UI").then((module) => ({
    default: module.InstanceComposerEditorPage,
  }))
);
const InstanceComposerViewerPage = lazy(() =>
  import("@/Slices/InstanceComposerViewer/UI").then((module) => ({
    default: module.InstanceComposerViewerPage,
  }))
);

/**
 * Wraps a lazily-loaded page in a Suspense boundary with a loading fallback.
 */
const withSuspense = (element: React.ReactElement): React.ReactElement => (
  <Suspense fallback={<LoadingView ariaLabel="LoadingComposer" />}>{element}</Suspense>
);

/**
 * The page element of each route kind. Every declared route kind needs one, so a route can't be
 * added without its page.
 */
const pageElements: Record<RouteKind, ReactElement> = {
  /**
   * Main
   */
  GraphiQL: <GraphiQLPage />,
  CreateEnvironment: <CreateEnvironmentPage />,
  Status: <StatusPage />,
  Settings: <SettingsPage />,
  NotificationCenter: <NotificationCenterPage />,
  UserManagement: <UserManagementPage />,

  /**
   * LSM
   */
  Dashboard: <DashboardPage />,
  Catalog: <ServiceCatalogPage />,
  Orders: <OrdersPage />,
  OrderDetails: <OrderDetailsPage />,
  Inventory: <ServiceInventoryPage />,

  ServiceDetails: <ServiceDetailsPage />,
  InstanceDetails: <ServiceInstanceDetailsPage />,
  InstanceComposer: withSuspense(<InstanceComposerPage />),
  InstanceComposerEditor: withSuspense(<InstanceComposerEditorPage />),
  InstanceComposerViewer: withSuspense(<InstanceComposerViewerPage />),
  CreateInstance: <CreateInstancePage />,
  EditInstance: <EditInstancePage />,
  DuplicateInstance: <DuplicateInstancePage />,
  Diagnose: <DiagnosePage />,
  Events: <EventsPage />,

  /**
   * Resource Manager
   */
  Resources: <ResourcesPage />,
  Agents: <AgentsPage />,
  DiscoveredResources: <DiscoveredResourcesPage />,
  DiscoveredResourceDetails: <DiscoveredResourceDetailsPage />,
  Facts: <FactsPage />,
  ResourceDetails: <ResourceDetailsPage />,

  /**
   * Orchestration Engine
   */

  CompileReports: <CompileReportsPage />,
  CompileDetails: <CompileDetailsPage />,
  DesiredState: <DesiredStatePage />,
  DesiredStateDetails: <DesiredStateDetailsPage />,
  DesiredStateResourceDetails: <DesiredStateResourceDetailsPage />,
  DesiredStateCompare: <DesiredStateComparePage />,
  Parameters: <ParametersPage />,
  ComplianceCheck: <ComplianceCheckPage />,
  MarkdownPreviewer: <MarkdownPreviewerPage />,
};

/**
 * Builds the pages of the registered routes.
 */
export class PrimaryPageManager implements PageManager {
  constructor(private readonly routes: Route[]) {}

  getPages(): Page[] {
    return this.routes.map((route) => ({ ...route, element: pageElements[route.kind] }));
  }
}
