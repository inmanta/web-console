import { Route } from "@/Core";

export const path = "/resource-discovery/:resourceId";

export const route = (base: string): Route<"DiscoveredResourceDetails"> => ({
  kind: "DiscoveredResourceDetails",
  parent: "DiscoveredResources",
  path: `${base}${path}`,
  generateLabel: () => "Discovered Resource Details",
  environmentRole: "Required",
});
