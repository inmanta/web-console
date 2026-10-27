import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Resources: undefined;
  }
}

export const path = "/resources";

export const route = (base: string): Route<"Resources"> => ({
  kind: "Resources",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Resources",
  environmentRole: "Required",
});
