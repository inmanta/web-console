import { Route } from "@/Core";

export const path = "/orders";

export const route = (base: string): Route<"Orders"> => ({
  kind: "Orders",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Orders",
  environmentRole: "Required",
});
