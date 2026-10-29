import { FeatureModule } from "@inmanta/web-console-core";
import * as CreateInstance from "@inmanta/web-console-feature-lsm/Slices/CreateInstance/Core/Route";
import * as Diagnose from "@inmanta/web-console-feature-lsm/Slices/Diagnose/Core/Route";
import * as DuplicateInstance from "@inmanta/web-console-feature-lsm/Slices/DuplicateInstance/Core/Route";
import * as EditInstance from "@inmanta/web-console-feature-lsm/Slices/EditInstance/Core/Route";
import * as Events from "@inmanta/web-console-feature-lsm/Slices/Events/Core/Route";
import * as MarkdownPreviewer from "@inmanta/web-console-feature-lsm/Slices/MarkdownPreviewer/Core/Route";
import * as OrderDetails from "@inmanta/web-console-feature-lsm/Slices/OrderDetails/Core/Route";
import * as Orders from "@inmanta/web-console-feature-lsm/Slices/Orders/Core/Route";
import * as ServiceCatalog from "@inmanta/web-console-feature-lsm/Slices/ServiceCatalog/Core/Route";
import * as ServiceDetails from "@inmanta/web-console-feature-lsm/Slices/ServiceDetails/Core/Route";
import * as InstanceDetails from "@inmanta/web-console-feature-lsm/Slices/ServiceInstanceDetails/Core/Route";
import * as ServiceInventory from "@inmanta/web-console-feature-lsm/Slices/ServiceInventory/Core/Route";
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
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/ServiceCatalog/UI").then(
          (module) => module.ServiceCatalogPage
        ),
    },
    {
      route: CreateInstance.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/CreateInstance/UI").then(
          (module) => module.CreateInstancePage
        ),
    },
    {
      route: Diagnose.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/Diagnose/UI").then(
          (module) => module.DiagnosePage
        ),
    },
    {
      route: DuplicateInstance.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/DuplicateInstance/UI").then(
          (module) => module.DuplicateInstancePage
        ),
    },
    {
      route: EditInstance.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/EditInstance/UI").then(
          (module) => module.EditInstancePage
        ),
    },
    {
      route: Events.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/Events/UI").then(
          (module) => module.EventsPage
        ),
    },
    {
      route: InstanceDetails.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/ServiceInstanceDetails/UI").then(
          (module) => module.ServiceInstanceDetailsPage
        ),
    },
    {
      route: ServiceInventory.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/ServiceInventory/UI").then(
          (module) => module.ServiceInventoryPage
        ),
    },
    {
      route: MarkdownPreviewer.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/MarkdownPreviewer/UI").then(
          (module) => module.MarkdownPreviewerPage
        ),
    },
    {
      route: ServiceDetails.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/ServiceDetails/UI").then(
          (module) => module.ServiceDetailsPage
        ),
    },
    {
      route: Orders.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/Orders/UI").then(
          (module) => module.OrdersPage
        ),
    },
    {
      route: OrderDetails.route,
      page: () =>
        import("@inmanta/web-console-feature-lsm/Slices/OrderDetails/UI").then(
          (module) => module.OrderDetailsPage
        ),
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
