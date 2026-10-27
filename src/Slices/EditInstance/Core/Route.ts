import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    EditInstance: { service: string; instance: string };
  }
}

export const path = "/lsm/catalog/:service/inventory/:instance/edit";

export const route = (base: string): Route<"EditInstance"> => ({
  kind: "EditInstance",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Edit Instance",
  environmentRole: "Required",
});
