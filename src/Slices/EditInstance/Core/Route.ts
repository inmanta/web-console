import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/edit";

export const route = (base: string): Route<"EditInstance"> => ({
  kind: "EditInstance",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Edit Instance",
  environmentRole: "Required",
});
