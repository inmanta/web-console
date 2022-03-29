import { Route } from "@/Core";

export const path = "/lsm/catalog";

export const route = (base: string): Route<"Catalog"> => ({
  kind: "Catalog",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Service Catalog",
  environmentRole: "Required",
});
