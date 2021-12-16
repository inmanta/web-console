import React from "react";
import { PageManager, Page, RouteDictionary } from "@/Core";
import { AgentProcessPage } from "./AgentProcess";
import { AgentsPage } from "./Agents";
import { CompileDetailsPage } from "./CompileDetails";
import { CompileReportsPage } from "./CompileReports";
import { CreateEnvironmentPage } from "./CreateEnvironment";
import { CreateInstancePage } from "./CreateInstance";
import { DesiredStatePage } from "./DesiredState";
import { DesiredStateDetailsPage } from "./DesiredStateDetails";
import { DiagnosePage } from "./Diagnose";
import { EditInstancePage } from "./EditInstance";
import { EventsPage } from "./Events";
import { HomePage } from "./Home";
import { ResourceDetailsPage } from "./ResourceDetails";
import { ResourcesPage } from "./Resources";
import { ServiceCatalogPage } from "./ServiceCatalog";
import { ServiceInstanceHistoryPage } from "./ServiceInstanceHistory";
import { ServiceInventoryPage } from "./ServiceInventory";
import { SettingsPage } from "./Settings";
import { StatusPage } from "./Status";

export class PrimaryPageManager implements PageManager {
  constructor(private readonly routeDictionary: RouteDictionary) {}

  getPages(): Page[] {
    return [
      { ...this.routeDictionary.Home, element: <HomePage /> },
      {
        ...this.routeDictionary.CreateEnvironment,
        element: <CreateEnvironmentPage />,
      },
      { ...this.routeDictionary.Status, element: <StatusPage /> },
      { ...this.routeDictionary.Catalog, element: <ServiceCatalogPage /> },
      { ...this.routeDictionary.Inventory, element: <ServiceInventoryPage /> },
      {
        ...this.routeDictionary.CreateInstance,
        element: <CreateInstancePage />,
      },
      { ...this.routeDictionary.EditInstance, element: <EditInstancePage /> },
      {
        ...this.routeDictionary.History,
        element: <ServiceInstanceHistoryPage />,
      },
      { ...this.routeDictionary.Diagnose, element: <DiagnosePage /> },
      { ...this.routeDictionary.Events, element: <EventsPage /> },
      { ...this.routeDictionary.Resources, element: <ResourcesPage /> },
      {
        ...this.routeDictionary.CompileReports,
        element: <CompileReportsPage />,
      },
      {
        ...this.routeDictionary.CompileDetails,
        element: <CompileDetailsPage />,
      },
      {
        ...this.routeDictionary.ResourceDetails,
        element: <ResourceDetailsPage />,
      },
      { ...this.routeDictionary.Settings, element: <SettingsPage /> },
      { ...this.routeDictionary.Agents, element: <AgentsPage /> },
      { ...this.routeDictionary.AgentProcess, element: <AgentProcessPage /> },
      { ...this.routeDictionary.DesiredState, element: <DesiredStatePage /> },
      {
        ...this.routeDictionary.DesiredStateDetails,
        element: <DesiredStateDetailsPage />,
      },
    ];
  }
}
