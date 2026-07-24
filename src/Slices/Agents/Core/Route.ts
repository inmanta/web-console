import { Route } from "@/Core";

export const path = "/agents";

export const route = (base: string): Route<"Agents"> => ({
  kind: "Agents",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Agents",
  environmentRole: "Required",
});
