import { Route } from "@/Core";

export const path = "/dashboard-v2";

export const route = (base: string): Route<"DashboardV2"> => ({
  kind: "DashboardV2",
  path: `${base}${path}`,
  generateLabel: () => "Dashboard V2",
  environmentRole: "Required",
});
