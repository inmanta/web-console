import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/composer-viewer";

/**
 * Creates a route object for the Instance Composer Viewer.
 * @param base The base path for the route.
 * @returns The route object.
 */
export const route = (base: string): Route<"InstanceComposerViewer"> => ({
  kind: "InstanceComposerViewer",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Composer Viewer",
  environmentRole: "Required",
});
