import { Route } from "@/Core";

export const path = "/desiredstate/:version";

export const route = (base: string): Route<"DesiredStateDetails"> => ({
  kind: "DesiredStateDetails",
  parent: "DesiredState",
  path: `${base}${path}`,
  generateLabel: () => "Details",
  environmentRole: "Required",
});
