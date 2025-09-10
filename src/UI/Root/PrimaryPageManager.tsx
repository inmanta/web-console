import React from "react";
import { PageManager, Page, RouteDictionary, PageDictionary } from "@/Core";
import { InstanceComposerPage } from "@/Slices/InstanceComposerCreator/UI";
import { InstanceComposerEditorPage } from "@/Slices/InstanceComposerEditor/UI";
import { InstanceComposerViewerPage } from "@/Slices/InstanceComposerViewer/UI";
import { MarkdownPreviewerPage } from "@/Slices/MarkdownPreviewer/UI";
import { OrderDetailsPage } from "@/Slices/OrderDetails/UI";
import { OrdersPage } from "@/Slices/Orders/UI";
import { DiscoveredResourcesPage } from "@/Slices/ResourceDiscovery/UI";
import { ServiceDetailsPage } from "@/Slices/ServiceDetails/UI";
import { ServiceInstanceDetailsPage } from "@/Slices/ServiceInstanceDetails/UI";
import { UserManagementPage } from "@/Slices/UserManagement/UI/Page";
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
import { HomePage } from "@S/Home/UI";
import { NotificationCenterPage } from "@S/Notification/UI/Center";
import { ParametersPage } from "@S/Parameters/UI";
import { ResourcesPage } from "@S/Resource/UI/ResourcesPage";
import { ResourceDetailsPage } from "@S/ResourceDetails/UI";
import { ServiceCatalogPage } from "@S/ServiceCatalog/UI";
import { ServiceInventoryPage } from "@S/ServiceInventory/UI";
import { SettingsPage } from "@S/Settings/UI";
import { StatusPage } from "@S/Status/UI";
import { DiscoveredResourceDetailsPage } from "@/Slices/ResourceDiscoveryDetails/UI";

export class PrimaryPageManager implements PageManager {
  private pageDictionary: PageDictionary;

  constructor(private readonly routeDictionary: RouteDictionary) {
    this.pageDictionary = {
      /**
       * Main
       */
      Home: { ...this.routeDictionary.Home, element: <HomePage /> },
      CreateEnvironment: {
        ...this.routeDictionary.CreateEnvironment,
        element: <CreateEnvironmentPage />,
      },
      Status: { ...this.routeDictionary.Status, element: <StatusPage /> },
      Settings: { ...this.routeDictionary.Settings, element: <SettingsPage /> },
      NotificationCenter: {
        ...this.routeDictionary.NotificationCenter,
        element: <NotificationCenterPage />,
      },
      UserManagement: {
        ...this.routeDictionary.UserManagement,
        element: <UserManagementPage />,
      },

      /**
       * LSM
       */
      Dashboard: {
        ...this.routeDictionary.Dashboard,
        element: <DashboardPage />,
      },
      Catalog: {
        ...this.routeDictionary.Catalog,
        element: <ServiceCatalogPage />,
      },
      Orders: {
        ...this.routeDictionary.Orders,
        element: <OrdersPage />,
      },
      OrderDetails: {
        ...this.routeDictionary.OrderDetails,
        element: <OrderDetailsPage />,
      },
      Inventory: {
        ...this.routeDictionary.Inventory,
        element: <ServiceInventoryPage />,
      },

      ServiceDetails: {
        ...this.routeDictionary.ServiceDetails,
        element: <ServiceDetailsPage />,
      },
      InstanceDetails: {
        ...this.routeDictionary.InstanceDetails,
        element: <ServiceInstanceDetailsPage />,
      },
      InstanceComposer: {
        ...this.routeDictionary.InstanceComposer,
        element: <InstanceComposerPage />,
      },
      InstanceComposerEditor: {
        ...this.routeDictionary.InstanceComposerEditor,
        element: <InstanceComposerEditorPage />,
      },
      InstanceComposerViewer: {
        ...this.routeDictionary.InstanceComposerViewer,
        element: <InstanceComposerViewerPage />,
      },
      CreateInstance: {
        ...this.routeDictionary.CreateInstance,
        element: <CreateInstancePage />,
      },
      EditInstance: {
        ...this.routeDictionary.EditInstance,
        element: <EditInstancePage />,
      },
      DuplicateInstance: {
        ...this.routeDictionary.DuplicateInstance,
        element: <DuplicateInstancePage />,
      },
      Diagnose: { ...this.routeDictionary.Diagnose, element: <DiagnosePage /> },
      Events: { ...this.routeDictionary.Events, element: <EventsPage /> },

      /**
       * Resource Manager
       */
      Resources: {
        ...this.routeDictionary.Resources,
        element: <ResourcesPage />,
      },
      Agents: { ...this.routeDictionary.Agents, element: <AgentsPage /> },
      DiscoveredResources: {
        ...this.routeDictionary.DiscoveredResources,
        element: <DiscoveredResourcesPage />,
      },
      DiscoveredResourceDetails: {
        ...this.routeDictionary.DiscoveredResourceDetails,
        element: <DiscoveredResourceDetailsPage />,
      },
      Facts: { ...this.routeDictionary.Facts, element: <FactsPage /> },
      ResourceDetails: {
        ...this.routeDictionary.ResourceDetails,
        element: <ResourceDetailsPage />,
      },

      /**
       * Orchestration Engine
       */

      CompileReports: {
        ...this.routeDictionary.CompileReports,
        element: <CompileReportsPage />,
      },
      CompileDetails: {
        ...this.routeDictionary.CompileDetails,
        element: <CompileDetailsPage />,
      },
      DesiredState: {
        ...this.routeDictionary.DesiredState,
        element: <DesiredStatePage />,
      },
      DesiredStateDetails: {
        ...this.routeDictionary.DesiredStateDetails,
        element: <DesiredStateDetailsPage />,
      },
      DesiredStateResourceDetails: {
        ...this.routeDictionary.DesiredStateResourceDetails,
        element: <DesiredStateResourceDetailsPage />,
      },
      DesiredStateCompare: {
        ...this.routeDictionary.DesiredStateCompare,
        element: <DesiredStateComparePage />,
      },
      Parameters: {
        ...this.routeDictionary.Parameters,
        element: <ParametersPage />,
      },
      ComplianceCheck: {
        ...this.routeDictionary.ComplianceCheck,
        element: <ComplianceCheckPage />,
      },
      MarkdownPreviewer: {
        ...this.routeDictionary.MarkdownPreviewer,
        element: <MarkdownPreviewerPage />,
      },
    };
  }

  getPages(): Page[] {
    return Object.values(this.pageDictionary);
  }
}
