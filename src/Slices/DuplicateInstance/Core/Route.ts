import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/duplicate";

export const route = (base: string): Route<"DuplicateInstance"> => ({
  kind: "DuplicateInstance",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Duplicate Instance",
  environmentRole: "Required",
});
