import { Route } from "@/Core";

export const path = "/desiredstate/compare/:from/:to";

export const route = (base: string): Route<"DesiredStateCompare"> => ({
  kind: "DesiredStateCompare",
  parent: "DesiredState",
  path: `${base}${path}`,
  generateLabel: () => "Compare",
  environmentRole: "Required",
});
