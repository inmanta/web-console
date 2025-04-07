import { Route } from "@/Core";

export const path = "/resources";

export const route = (base: string): Route<"Resources"> => ({
  kind: "Resources",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Resources",
  environmentRole: "Required",
});
