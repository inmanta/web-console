import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
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
