import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/composer";

/**
 * Creates a route object for the Instance Composer Editor.
 * @param base The base path for the route.
 * @returns The route object.
 */
export const route = (base: string): Route<"InstanceComposerEditor"> => ({
  kind: "InstanceComposerEditor",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Composer Editor",
  environmentRole: "Required",
});
