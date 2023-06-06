import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/composer";

export const route = (base: string): Route<"InstanceComposerEditor"> => ({
  kind: "InstanceComposerEditor",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Composer Editor",
  environmentRole: "Required",
});
