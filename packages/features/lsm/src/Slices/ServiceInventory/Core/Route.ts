import { Route } from "@inmanta/web-console-core";

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
  generateLabel: (params) => `Service Inventory: ${params.service}`,
  environmentRole: "Required",
});
