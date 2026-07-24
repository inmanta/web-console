import { Route } from "@/Core";

export const path = "/orders";

export const route = (base: string): Route<"Orders"> => ({
  kind: "Orders",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Orders",
  environmentRole: "Required",
});
