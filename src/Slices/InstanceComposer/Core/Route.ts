import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/composer";

/**
 * Creates a route object for the Instance Composer.
 *
 * @param base - The base path for the route.
 * @returns A route object with the kind set to "InstanceComposer".
 */
export const route = (base: string): Route<"InstanceComposer"> => ({
  kind: "InstanceComposer",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Instance Composer",
  environmentRole: "Required",
});
