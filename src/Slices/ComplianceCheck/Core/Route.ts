import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    ComplianceCheck: { version: string };
  }
}

export const path = "/desiredstate/:version/compliancecheck";

export const route = (base: string): Route<"ComplianceCheck"> => ({
  kind: "ComplianceCheck",
  parent: "DesiredState",
  path: `${base}${path}`,
  generateLabel: () => "Compliance Check",
  environmentRole: "Required",
});
