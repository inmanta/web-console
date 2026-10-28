import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    CreateEnvironment: undefined;
  }
}

export const path = "/environment/create";

export const route = (base: string): Route<"CreateEnvironment"> => ({
  kind: "CreateEnvironment",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Create Environment",
  environmentRole: "Forbidden",
});
