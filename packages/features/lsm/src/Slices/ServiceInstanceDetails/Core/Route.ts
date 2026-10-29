import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    InstanceDetails: { service: string; instance: string; instanceId: string };
  }
}

export const path = "/lsm/catalog/:service/inventory/:instance/:instanceId/details";

export const route = (base: string): Route<"InstanceDetails"> => ({
  kind: "InstanceDetails",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: (params) => `Instance Details: ${params.instance}`,
  environmentRole: "Required",
});
