import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/composer";

export const route = (base: string): Route<"InstanceEditor"> => ({
  kind: "InstanceEditor",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Modifier",
  environmentRole: "Required",
});
