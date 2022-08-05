import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/diagnose";

export const route = (base: string): Route<"Diagnose"> => ({
  kind: "Diagnose",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Diagnose Service Instance",
  environmentRole: "Required",
});
