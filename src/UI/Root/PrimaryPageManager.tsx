import React from "react";
import { PageManager, Page, RouteDictionary } from "@/Core";
import { CompileDetailsPage } from "@/UI/Pages/CompileDetails";
import { CompileReportsPage } from "@/UI/Pages/CompileReports";
import { CreateInstancePage } from "@/UI/Pages/CreateInstance";
import { DiagnosePage } from "@/UI/Pages/Diagnose";
import { EditInstancePage } from "@/UI/Pages/EditInstance";
import { EventsPage } from "@/UI/Pages/Events";
import { ResourceDetailsPage } from "@/UI/Pages/ResourceDetails";
import { ResourcesPage } from "@/UI/Pages/Resources";
import { ServiceCatalogPage } from "@/UI/Pages/ServiceCatalog";
import { ServiceInstanceHistoryPage } from "@/UI/Pages/ServiceInstanceHistory";
import { ServiceInventoryPage } from "@/UI/Pages/ServiceInventory";
import { SettingsPage } from "@/UI/Pages/Settings";
import { StatusPage } from "@/UI/Pages/Status";

export class PrimaryPageManager implements PageManager {
  constructor(private readonly routeDictionary: RouteDictionary) {}

  getPages(): Page[] {
    return [
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
      { ...this.routeDictionary.Status, element: <StatusPage /> },
    ];
  }
}
