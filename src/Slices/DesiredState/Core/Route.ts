import { Route } from "@/Core";

export const path = "/desiredstate";

export const route = (base: string): Route<"DesiredState"> => ({
  kind: "DesiredState",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Desired State",
  environmentRole: "Required",
});
