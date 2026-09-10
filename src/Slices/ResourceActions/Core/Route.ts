import { Route } from "@/Core";

export const path = "/resource_actions";

export const route = (base: string): Route<"ResourceActions"> => ({
  kind: "ResourceActions",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Changelog",
  environmentRole: "Required",
});
