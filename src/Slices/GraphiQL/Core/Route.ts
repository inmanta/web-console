import { Route } from "@/Core";

export const path = "/graphiql";

export const route = (base: string): Route<"GraphiQL"> => ({
  kind: "GraphiQL",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "GraphiQL",
  environmentRole: "Optional",
});
