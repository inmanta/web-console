import { Route } from "@/Core";

export const path =
  "/lsm/catalog/:service/inventory/:instance/:version/details";

export const route = (base: string): Route<"InstanceDetails"> => ({
  kind: "InstanceDetails",
  parent: "Catalog",
  path: `${base}${path}`,
  generateLabel: (params) => `Service Instance: ${params.instance}`,
  environmentRole: "Required",
});
