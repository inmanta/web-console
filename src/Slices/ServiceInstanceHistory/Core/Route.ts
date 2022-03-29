import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/history";

export const route = (base: string): Route<"History"> => ({
  kind: "History",
  parent: "Inventory",
  path: `${base}${path}`,
  generateLabel: () => "Service Instance History",
  environmentRole: "Required",
});
