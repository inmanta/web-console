import { ComponentType } from "react";
import { Route } from "@/UI/Routing";
import { CreateInstancePageProvider } from "@/UI/Pages/CreateInstance";
import { DiagnoseWithProvider } from "@/UI/Pages/Diagnose";
import { ServiceInstanceHistoryWithProvider } from "@/UI/Pages/ServiceInstanceHistory";
import { ServiceInventoryWithProvider } from "@/UI/Pages/ServiceInventory";
import { EventsWithProvider } from "@/UI/Pages/Events";
import { ServiceCatalog } from "@/UI/Pages/ServiceCatalog";
import { ResourcesView } from "@/UI/Pages/Resources";
import { EditInstancePageProvider } from "@/UI/Pages/EditInstance";
import { CompileReports } from "@/UI/Pages/CompileReports";
import { CompileDetailsWithProvider } from "./CompileDetails";
import { ResourceDetailsWithProvider } from "@/UI/Pages/ResourceDetails";
import { SettingsPage } from "./Settings";

interface Page extends Route.Route {
  component: ComponentType;
}

export const Catalog: Page = {
  ...Route.Catalog,
  component: ServiceCatalog,
};

export const Inventory: Page = {
  ...Route.Inventory,
  component: ServiceInventoryWithProvider,
};

export const CreateInstance: Page = {
  ...Route.CreateInstance,
  component: CreateInstancePageProvider,
};

export const EditInstance: Page = {
  ...Route.EditInstance,
  component: EditInstancePageProvider,
};

export const History: Page = {
  ...Route.History,
  component: ServiceInstanceHistoryWithProvider,
};

export const Diagnose: Page = {
  ...Route.Diagnose,
  component: DiagnoseWithProvider,
};

export const Events: Page = {
  ...Route.Events,
  component: EventsWithProvider,
};

export const Resources: Page = {
  ...Route.Resources,
  component: ResourcesView,
};

export const CompileReportsPage: Page = {
  ...Route.CompileReports,
  component: CompileReports,
};

export const CompileDetails: Page = {
  ...Route.CompileDetails,
  component: CompileDetailsWithProvider,
};

export const ResourceDetails: Page = {
  ...Route.ResourceDetails,
  component: ResourceDetailsWithProvider,
};

export const Settings: Page = {
  ...Route.Settings,
  component: SettingsPage,
};

export const pages: Page[] = [
  Catalog,
  Inventory,
  CreateInstance,
  EditInstance,
  History,
  Diagnose,
  Events,
  Resources,
  CompileReportsPage,
  CompileDetails,
  ResourceDetails,
  Settings,
];
