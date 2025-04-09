import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/:instanceId/details";

export const route = (base: string): Route<"InstanceDetails"> => ({
  kind: "InstanceDetails",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: (params) => `Instance Details: ${params.instance}`,
  environmentRole: "Required",
});
