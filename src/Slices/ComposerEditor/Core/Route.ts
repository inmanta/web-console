import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/composer";

export const route = (base: string): Route<"ComposerEditor"> => ({
  kind: "ComposerEditor",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Modifier",
  environmentRole: "Required",
});
