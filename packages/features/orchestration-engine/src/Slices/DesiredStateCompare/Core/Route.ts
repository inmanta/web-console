import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    DesiredStateCompare: { from: string; to: string };
  }
}

export const path = "/desiredstate/compare/:from/:to";

export const route = (base: string): Route<"DesiredStateCompare"> => ({
  kind: "DesiredStateCompare",
  parent: "DesiredState",
  path: `${base}${path}`,
  generateLabel: () => "Compare",
  environmentRole: "Required",
});
