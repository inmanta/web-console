import { Route } from "@/Core";

export const path = "/status";

export const route = (base: string): Route<"Status"> => ({
  kind: "Status",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Status",
  environmentRole: "Optional",
});
