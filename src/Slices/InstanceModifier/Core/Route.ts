import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/composer";

export const route = (base: string): Route<"InstanceModifier"> => ({
  kind: "InstanceModifier",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Modifier",
  environmentRole: "Required",
});
