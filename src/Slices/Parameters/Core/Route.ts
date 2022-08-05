import { Route } from "@/Core";

export const path = "/parameters";

export const route = (base: string): Route<"Parameters"> => ({
  kind: "Parameters",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Parameters",
  environmentRole: "Required",
});
