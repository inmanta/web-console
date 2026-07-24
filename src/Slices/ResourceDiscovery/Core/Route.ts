import { Route } from "@/Core";

export const path = "/resource-discovery";

export const route = (base: string): Route<"DiscoveredResources"> => ({
  kind: "DiscoveredResources",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Discovered Resources",
  environmentRole: "Required",
});
