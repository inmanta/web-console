import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
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
