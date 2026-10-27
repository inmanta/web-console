import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Status: undefined;
  }
}

export const path = "/status";

export const route = (base: string): Route<"Status"> => ({
  kind: "Status",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Status",
  environmentRole: "Optional",
});
