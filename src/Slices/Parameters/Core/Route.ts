import { Route } from "@/Core";

export const path = "/parameters";

export const route = (base: string): Route<"Parameters"> => ({
  kind: "Parameters",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Parameters",
  environmentRole: "Required",
});
