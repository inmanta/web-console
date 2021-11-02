import { PageManager, Page, RouteDictionary } from "@/Core";
import { CreateInstancePage } from "@/UI/Pages/CreateInstance";
import { DiagnosePage } from "@/UI/Pages/Diagnose";
import { ServiceInstanceHistoryPage } from "@/UI/Pages/ServiceInstanceHistory";
import { ServiceInventoryPage } from "@/UI/Pages/ServiceInventory";
import { EventsPage } from "@/UI/Pages/Events";
import { ServiceCatalogPage } from "@/UI/Pages/ServiceCatalog";
import { ResourcesPage } from "@/UI/Pages/Resources";
import { EditInstancePage } from "@/UI/Pages/EditInstance";
import { CompileReportsPage } from "@/UI/Pages/CompileReports";
import { CompileDetailsPage } from "./CompileDetails";
import { ResourceDetailsPage } from "@/UI/Pages/ResourceDetails";
import { SettingsPage } from "@/UI/Pages/Settings";

export class PrimaryPageManager implements PageManager {
  constructor(private readonly routeDictionary: RouteDictionary) {}

  getPages(): Page[] {
    return [
      { ...this.routeDictionary.Catalog, component: ServiceCatalogPage },
      { ...this.routeDictionary.Inventory, component: ServiceInventoryPage },
      { ...this.routeDictionary.CreateInstance, component: CreateInstancePage },
      { ...this.routeDictionary.EditInstance, component: EditInstancePage },
      {
        ...this.routeDictionary.History,
        component: ServiceInstanceHistoryPage,
      },
      { ...this.routeDictionary.Diagnose, component: DiagnosePage },
      { ...this.routeDictionary.Events, component: EventsPage },
      { ...this.routeDictionary.Resources, component: ResourcesPage },
      { ...this.routeDictionary.CompileReports, component: CompileReportsPage },
      { ...this.routeDictionary.CompileDetails, component: CompileDetailsPage },
      {
        ...this.routeDictionary.ResourceDetails,
        component: ResourceDetailsPage,
      },
      { ...this.routeDictionary.Settings, component: SettingsPage },
    ];
  }
}
