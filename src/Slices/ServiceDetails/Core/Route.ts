import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    ServiceDetails: { service: string };
  }
}

export const path = "/lsm/catalog/:service/details";

export const route = (base: string): Route<"ServiceDetails"> => ({
  kind: "ServiceDetails",
  parent: "Catalog",
  path: `${base}${path}`,
  generateLabel: (params) => `Service Details: ${params.service}`,
  environmentRole: "Required",
});
