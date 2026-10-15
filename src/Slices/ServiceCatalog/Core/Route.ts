import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    Catalog: undefined;
  }
}

export const path = "/lsm/catalog";

export const route = (base: string): Route<"Catalog"> => ({
  kind: "Catalog",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Service Catalog",
  environmentRole: "Required",
});
