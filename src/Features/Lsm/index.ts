import { FeatureModule } from "@/Core";
import * as CreateInstance from "@S/CreateInstance/Core/Route";
import * as Diagnose from "@S/Diagnose/Core/Route";
import * as DuplicateInstance from "@S/DuplicateInstance/Core/Route";
import * as EditInstance from "@S/EditInstance/Core/Route";
import * as Events from "@S/Events/Core/Route";
import * as MarkdownPreviewer from "@S/MarkdownPreviewer/Core/Route";
import * as OrderDetails from "@S/OrderDetails/Core/Route";
import * as Orders from "@S/Orders/Core/Route";
import * as ServiceCatalog from "@S/ServiceCatalog/Core/Route";
import * as ServiceDetails from "@S/ServiceDetails/Core/Route";
import * as InstanceDetails from "@S/ServiceInstanceDetails/Core/Route";
import * as ServiceInventory from "@S/ServiceInventory/Core/Route";
import { lsmMessages } from "./messages";

/**
 * The Lifecycle Service Manager: the service catalog, the inventory and its instances, and orders.
 */
export const lsmFeature: FeatureModule = {
  id: "lsm",
  version: APP_VERSION,
  messages: lsmMessages,
  routes: [
    {
      route: ServiceCatalog.route,
      page: () => import("@S/ServiceCatalog/UI").then((module) => module.ServiceCatalogPage),
    },
    {
      route: CreateInstance.route,
      page: () => import("@S/CreateInstance/UI").then((module) => module.CreateInstancePage),
    },
    {
      route: Diagnose.route,
      page: () => import("@S/Diagnose/UI").then((module) => module.DiagnosePage),
    },
    {
      route: DuplicateInstance.route,
      page: () => import("@S/DuplicateInstance/UI").then((module) => module.DuplicateInstancePage),
    },
    {
      route: EditInstance.route,
      page: () => import("@S/EditInstance/UI").then((module) => module.EditInstancePage),
    },
    {
      route: Events.route,
      page: () => import("@S/Events/UI").then((module) => module.EventsPage),
    },
    {
      route: InstanceDetails.route,
      page: () =>
        import("@S/ServiceInstanceDetails/UI").then((module) => module.ServiceInstanceDetailsPage),
    },
    {
      route: ServiceInventory.route,
      page: () => import("@S/ServiceInventory/UI").then((module) => module.ServiceInventoryPage),
    },
    {
      route: MarkdownPreviewer.route,
      page: () => import("@S/MarkdownPreviewer/UI").then((module) => module.MarkdownPreviewerPage),
    },
    {
      route: ServiceDetails.route,
      page: () => import("@S/ServiceDetails/UI").then((module) => module.ServiceDetailsPage),
    },
    {
      route: Orders.route,
      page: () => import("@S/Orders/UI").then((module) => module.OrdersPage),
    },
    {
      route: OrderDetails.route,
      page: () => import("@S/OrderDetails/UI").then((module) => module.OrderDetailsPage),
    },
  ],
  navigation: [
    {
      kind: "Catalog",
      group: "lifecycleServiceManager",
      isVisible: (orchestratorProvider) => orchestratorProvider.isLsmEnabled(),
    },
    {
      kind: "Orders",
      group: "lifecycleServiceManager",
      isVisible: (orchestratorProvider) =>
        orchestratorProvider.isLsmEnabled() && orchestratorProvider.isOrderViewEnabled(),
    },
  ],
};
