import { Route } from "@/Core";

export const path = "/environment/create";

export const route = (base: string): Route<"CreateEnvironment"> => ({
  kind: "CreateEnvironment",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Create Environment",
  environmentRole: "Forbidden",
});
