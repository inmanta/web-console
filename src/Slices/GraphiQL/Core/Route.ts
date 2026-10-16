import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
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
