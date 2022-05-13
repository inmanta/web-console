import { Route } from "@/Core";

export const path = "/resourcesv2";

export const route = (base: string): Route<"ResourcesV2"> => ({
  kind: "ResourcesV2",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Resources V2",
  environmentRole: "Required",
});
