import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    Dashboard: undefined;
  }
}

export const path = "/dashboard";

export const route = (base: string): Route<"Dashboard"> => ({
  kind: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Dashboard",
  environmentRole: "Required",
});
