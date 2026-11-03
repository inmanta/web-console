import { Route, words } from "@inmanta/web-console-core";
import { useGetServiceTitle } from "@inmanta/web-console-core/Queries/Slices/Service";

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
  generateLabel: (params) => words("ServiceDetails.title")(params.service),
  useLabel: (params) =>
    words("ServiceDetails.title")(useGetServiceTitle(decodeURIComponent(params.service))),
  environmentRole: "Required",
});
