import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/composer-viewer";

export const route = (base: string): Route<"InstanceComposerViewer"> => ({
  kind: "InstanceComposerViewer",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Composer Viewer",
  environmentRole: "Required",
});
