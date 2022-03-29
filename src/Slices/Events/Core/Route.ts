import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/events";

export const route = (base: string): Route<"Events"> => ({
  kind: "Events",
  parent: "Inventory",
  generateLabel: () => "Service Instance Events",
  path: `${base}${path}`,
  environmentRole: "Required",
});
