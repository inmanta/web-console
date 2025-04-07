import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory";

export const route = (base: string): Route<"Inventory"> => ({
  kind: "Inventory",
  parent: "Catalog",
  path: `${base}${path}`,
  generateLabel: (params) => `Service Inventory: ${params.service}`,
  environmentRole: "Required",
});
