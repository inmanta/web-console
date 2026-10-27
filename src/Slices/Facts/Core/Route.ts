import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    Facts: undefined;
  }
}

export const path = "/facts";

export const route = (base: string): Route<"Facts"> => ({
  kind: "Facts",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Facts",
  environmentRole: "Required",
});
