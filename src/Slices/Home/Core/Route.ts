import { Route } from "@/Core";

export const path = "/";

export const route = (base: string): Route<"Home"> => ({
  kind: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Home",
  environmentRole: "Forbidden",
});
