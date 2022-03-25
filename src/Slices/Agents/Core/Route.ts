import { Route } from "@/Core";

export const path = "/agents";

export const route = (base: string): Route<"Agents"> => ({
  kind: "Agents",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Agents",
  environmentRole: "Required",
});
