import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    Diagnose: { service: string; instance: string };
  }
}

export const path = "/lsm/catalog/:service/inventory/:instance/diagnose";

export const route = (base: string): Route<"Diagnose"> => ({
  kind: "Diagnose",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Diagnose Service Instance",
  environmentRole: "Required",
});
