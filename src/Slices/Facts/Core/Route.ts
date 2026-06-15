import { Route } from "@/Core";

export const path = "/facts";

export const route = (base: string): Route<"Facts"> => ({
  kind: "Facts",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Facts",
  environmentRole: "Required",
});
