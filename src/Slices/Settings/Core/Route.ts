import { Route } from "@/Core";

export const path = "/settings";

export const route = (base: string): Route<"Settings"> => ({
  kind: "Settings",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Settings",
  environmentRole: "Required",
});
