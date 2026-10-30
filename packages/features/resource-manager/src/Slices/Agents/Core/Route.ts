import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Agents: undefined;
  }
}

export const path = "/agents";

export const route = (base: string): Route<"Agents"> => ({
  kind: "Agents",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Agents",
  environmentRole: "Required",
});
