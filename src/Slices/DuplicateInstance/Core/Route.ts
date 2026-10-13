import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    DuplicateInstance: { service: string; instance: string };
  }
}

export const path = "/lsm/catalog/:service/inventory/:instance/duplicate";

export const route = (base: string): Route<"DuplicateInstance"> => ({
  kind: "DuplicateInstance",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Duplicate Instance",
  environmentRole: "Required",
});
