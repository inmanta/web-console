import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    Parameters: undefined;
  }
}

export const path = "/parameters";

export const route = (base: string): Route<"Parameters"> => ({
  kind: "Parameters",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Parameters",
  environmentRole: "Required",
});
