import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
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
