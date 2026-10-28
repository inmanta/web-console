import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    InstanceComposerViewer: { service: string; instance: string };
  }
}

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
