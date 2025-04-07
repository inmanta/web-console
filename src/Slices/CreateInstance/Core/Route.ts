import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/add";

export const route = (base: string): Route<"CreateInstance"> => ({
  kind: "CreateInstance",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Create Instance",
  environmentRole: "Required",
});
