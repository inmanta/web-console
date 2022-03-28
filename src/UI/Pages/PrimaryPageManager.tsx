import React from "react";
import { PageManager, Page, RouteDictionary, PageDictionary } from "@/Core";
import { AgentProcessPage } from "@S/AgentProcess/UI";
import { AgentsPage } from "@S/Agents/UI";
import { CompileDetailsPage } from "@S/CompileDetails/UI";
import { CompileReportsPage } from "@S/CompileReports/UI";
import { ComplianceCheckPage } from "@S/ComplianceCheck/UI";
import { DiagnosePage } from "@S/Diagnose/UI";
import { EventsPage } from "@S/Events/UI";
import { FactsPage } from "@S/Facts/UI";
import { NotificationCenterPage } from "@S/Notification/UI/Center";
import { ResourcesPage } from "@S/Resource/UI/ResourcesPage";
import { ServiceInstanceHistoryPage } from "@S/ServiceInstanceHistory/UI";
import { SettingsPage } from "@S/Settings/UI";
import { CreateEnvironmentPage } from "./CreateEnvironment";
import { CreateInstancePage } from "./CreateInstance";
import { DesiredStatePage } from "./DesiredState";
import { DesiredStateComparePage } from "./DesiredStateCompare";
import { DesiredStateDetailsPage } from "./DesiredStateDetails";
import { DesiredStateResourceDetailsPage } from "./DesiredStateResourceDetails";
import { EditInstancePage } from "./EditInstance";
import { HomePage } from "./Home";
import { ParametersPage } from "./Parameters";
import { ResourceDetailsPage } from "./ResourceDetails";
import { ServiceCatalogPage } from "./ServiceCatalog";
import { ServiceInventoryPage } from "./ServiceInventory";
import { StatusPage } from "./Status";

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

      /**
       * LSM
       */
      Catalog: {
        ...this.routeDictionary.Catalog,
        element: <ServiceCatalogPage />,
      },
      Inventory: {
        ...this.routeDictionary.Inventory,
        element: <ServiceInventoryPage />,
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
  }

  getPages(): Page[] {
    return Object.values(this.pageDictionary);
  }
}
