import { Route, words } from "@inmanta/web-console-core";
import { useGetServiceTitle } from "@inmanta/web-console-core/Queries/Slices/Service";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Inventory: { service: string };
  }
}

export const path = "/lsm/catalog/:service/inventory";

export const route = (base: string): Route<"Inventory"> => ({
  kind: "Inventory",
  parent: "Catalog",
  path: `${base}${path}`,
  generateLabel: (params) => words("inventory.title")(params.service),
  useLabel: (params) =>
    words("inventory.title")(useGetServiceTitle(decodeURIComponent(params.service))),
  environmentRole: "Required",
});
