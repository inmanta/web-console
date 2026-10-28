import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
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
