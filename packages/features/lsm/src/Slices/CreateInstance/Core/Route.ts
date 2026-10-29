import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    CreateInstance: { service: string };
  }
}

export const path = "/lsm/catalog/:service/inventory/add";

export const route = (base: string): Route<"CreateInstance"> => ({
  kind: "CreateInstance",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Create Instance",
  environmentRole: "Required",
});
