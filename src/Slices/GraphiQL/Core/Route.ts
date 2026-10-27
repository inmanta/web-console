import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    GraphiQL: undefined;
  }
}

export const path = "/graphiql";

export const route = (base: string): Route<"GraphiQL"> => ({
  kind: "GraphiQL",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "GraphiQL",
  environmentRole: "Optional",
});
