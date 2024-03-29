import { Route } from "@/Core";

export const path = "/dashboard";

export const route = (base: string): Route<"Dashboard"> => ({
  kind: "Dashboard",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Dashboard",
  environmentRole: "Required",
});
