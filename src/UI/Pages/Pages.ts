import { ComponentType } from "react";
import { Route } from "@/UI/Routing";
import { CreateInstancePageWithProvider } from "@/UI/Pages/ServiceInstanceForm";
import { DiagnoseWithProvider } from "@/UI/Pages/Diagnose";
import { ServiceInstanceHistoryWithProvider } from "@/UI/Pages/ServiceInstanceHistory";
import { ServiceInventoryWithProvider } from "@/UI/Pages/ServiceInventory";
import { EventsWithProvider } from "@/UI/Pages/Events";
import { ServiceCatalog } from "@/UI/Pages/ServiceCatalog";
import { ResourcesView } from "@/UI/Pages/Resources";

interface Page extends Route.Route {
  component: ComponentType;
}

export const CatalogPage: Page = {
  ...Route.Catalog,
  component: ServiceCatalog,
};

export const InventoryPage: Page = {
  ...Route.Inventory,
  component: ServiceInventoryWithProvider,
};

export const CreateInstancePage: Page = {
  ...Route.CreateInstance,
  component: CreateInstancePageWithProvider,
};

export const HistoryPage: Page = {
  ...Route.History,
  component: ServiceInstanceHistoryWithProvider,
};

export const DiagnosePage: Page = {
  ...Route.Diagnose,
  component: DiagnoseWithProvider,
};

export const EventsPage: Page = {
  ...Route.Events,
  component: EventsWithProvider,
};

export const ResourcesPage: Page = {
  ...Route.Resources,
  component: ResourcesView,
};

export const pages: Page[] = [
  CatalogPage,
  InventoryPage,
  CreateInstancePage,
  HistoryPage,
  DiagnosePage,
  EventsPage,
  ResourcesPage,
];
