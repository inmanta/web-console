import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    Settings: undefined;
  }
}

export const path = "/settings";

export const route = (base: string): Route<"Settings"> => ({
  kind: "Settings",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Settings",
  environmentRole: "Required",
});
