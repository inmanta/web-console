import { ComponentType } from "react";
import { Route } from "@/UI/Routing";
import { CreateInstancePageProvider } from "@/UI/Pages/CreateInstance";
import { DiagnoseWithProvider } from "@/UI/Pages/Diagnose";
import { ServiceInstanceHistoryWithProvider } from "@/UI/Pages/ServiceInstanceHistory";
import { ServiceInventoryWithProvider } from "@/UI/Pages/ServiceInventory";
import { EventsWithProvider } from "@/UI/Pages/Events";
import { ServiceCatalog } from "@/UI/Pages/ServiceCatalog";
import { ResourcesView } from "@/UI/Pages/Resources";
import { ResourceHistoryWithProvider } from "@/UI/Pages/ResourceHistory";
import { EditInstancePageProvider } from "@/UI/Pages/EditInstance";

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
  component: CreateInstancePageProvider,
};

export const EditInstancePage: Page = {
  ...Route.EditInstance,
  component: EditInstancePageProvider,
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

export const ResourceHistoryPage: Page = {
  ...Route.ResourceHistory,
  component: ResourceHistoryWithProvider,
};

export const pages: Page[] = [
  CatalogPage,
  InventoryPage,
  CreateInstancePage,
  EditInstancePage,
  HistoryPage,
  DiagnosePage,
  EventsPage,
  ResourcesPage,
  ResourceHistoryPage,
];
