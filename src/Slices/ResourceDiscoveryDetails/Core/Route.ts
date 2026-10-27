import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    DiscoveredResourceDetails: { resourceId: string };
  }
}

export const path = "/resource-discovery/:resourceId";

export const route = (base: string): Route<"DiscoveredResourceDetails"> => ({
  kind: "DiscoveredResourceDetails",
  parent: "DiscoveredResources",
  path: `${base}${path}`,
  generateLabel: () => "Discovered Resource Details",
  environmentRole: "Required",
});
