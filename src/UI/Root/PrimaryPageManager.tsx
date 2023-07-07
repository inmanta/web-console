import React from "react";
import {
  PageManager,
  Page,
  RouteDictionary,
  PageDictionary,
  RestrictedPageDictionary,
} from "@/Core";
import { InstanceComposerPage } from "@/Slices/InstanceComposer/UI";
import { InstanceComposerEditorPage } from "@/Slices/InstanceComposerEditor/UI";
import { ServiceDetailsPage } from "@/Slices/ServiceDetails/UI";
import { AgentProcessPage } from "@S/AgentProcess/UI";
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
import { EditInstancePage } from "@S/EditInstance/UI";
import { EventsPage } from "@S/Events/UI";
import { FactsPage } from "@S/Facts/UI";
import { HomePage } from "@S/Home/UI";
import { NotificationCenterPage } from "@S/Notification/UI/Center";
import { ParametersPage } from "@S/Parameters/UI";
import { ResourcesPage } from "@S/Resource/UI/ResourcesPage";
import { ResourceDetailsPage } from "@S/ResourceDetails/UI";
import { ServiceCatalogPage } from "@S/ServiceCatalog/UI";
import { ServiceInstanceHistoryPage } from "@S/ServiceInstanceHistory/UI";
import { ServiceInventoryPage } from "@S/ServiceInventory/UI";
import { SettingsPage } from "@S/Settings/UI";
import { StatusPage } from "@S/Status/UI";

export class PrimaryPageManager implements PageManager {
  private pageDictionary: PageDictionary;
  private restrictedPageDictionary: RestrictedPageDictionary;

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
      Inventory: {
        ...this.routeDictionary.Inventory,
        element: <ServiceInventoryPage />,
      },

      ServiceDetails: {
        ...this.routeDictionary.ServiceDetails,
        element: <ServiceDetailsPage />,
      },
      CreateInstance: {
        ...this.routeDictionary.CreateInstance,
        element: <CreateInstancePage />,
      },
      EditInstance: {
        ...this.routeDictionary.EditInstance,
        element: <EditInstancePage />,
      },
      History: {
        ...this.routeDictionary.History,
        element: <ServiceInstanceHistoryPage />,
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
      Facts: { ...this.routeDictionary.Facts, element: <FactsPage /> },
      AgentProcess: {
        ...this.routeDictionary.AgentProcess,
        element: <AgentProcessPage />,
      },
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
    };

    this.restrictedPageDictionary = {
      InstanceComposer: {
        ...this.routeDictionary.InstanceComposer,
        element: <InstanceComposerPage />,
      },
      InstanceComposerEditor: {
        ...this.routeDictionary.InstanceComposerEditor,
        element: <InstanceComposerEditorPage />,
      },
    };
  }

  getPages(): Page[] {
    if (
      globalThis.features !== undefined &&
      globalThis.features.includes("instanceComposer")
    ) {
      return [
        ...Object.values(this.pageDictionary),
        ...Object.values(this.restrictedPageDictionary),
      ];
    } else {
      return Object.values(this.pageDictionary);
    }
  }
}
