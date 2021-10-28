import { ComponentType } from "react";
import { Route as _Route } from "@/Core";
import { Route } from "@/UI/Routing";
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
import { SettingsPage } from "./Settings";

interface Page extends _Route {
  component: ComponentType;
}

export const Catalog: Page = {
  ...Route.Catalog,
  component: ServiceCatalogPage,
};

export const Inventory: Page = {
  ...Route.Inventory,
  component: ServiceInventoryPage,
};

export const CreateInstance: Page = {
  ...Route.CreateInstance,
  component: CreateInstancePage,
};

export const EditInstance: Page = {
  ...Route.EditInstance,
  component: EditInstancePage,
};

export const History: Page = {
  ...Route.History,
  component: ServiceInstanceHistoryPage,
};

export const Diagnose: Page = {
  ...Route.Diagnose,
  component: DiagnosePage,
};

export const Events: Page = {
  ...Route.Events,
  component: EventsPage,
};

export const Resources: Page = {
  ...Route.Resources,
  component: ResourcesPage,
};

export const CompileReports: Page = {
  ...Route.CompileReports,
  component: CompileReportsPage,
};

export const CompileDetails: Page = {
  ...Route.CompileDetails,
  component: CompileDetailsPage,
};

export const ResourceDetails: Page = {
  ...Route.ResourceDetails,
  component: ResourceDetailsPage,
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
  CompileReports,
  CompileDetails,
  ResourceDetails,
  Settings,
];
