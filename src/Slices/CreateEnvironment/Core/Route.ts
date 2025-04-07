import { Route } from "@/Core";

export const path = "/environment/create";

export const route = (base: string): Route<"CreateEnvironment"> => ({
  kind: "CreateEnvironment",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "Create Environment",
  environmentRole: "Forbidden",
});
