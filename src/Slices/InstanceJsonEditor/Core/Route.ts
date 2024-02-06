import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/editor/add";

export const route = (base: string): Route<"CreateInstanceEditor"> => ({
  kind: "CreateInstanceEditor",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Create Instance in Json Editor",
  environmentRole: "Required",
});
