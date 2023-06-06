import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/composer";

export const route = (base: string): Route<"InstanceComposer"> => ({
  kind: "InstanceComposer",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Composer",
  environmentRole: "Required",
});
