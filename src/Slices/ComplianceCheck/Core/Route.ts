import { Route } from "@/Core";

export const path = "/desiredstate/:version/compliancecheck";

export const route = (base: string): Route<"ComplianceCheck"> => ({
  kind: "ComplianceCheck",
  parent: "DesiredState",
  path: `${base}${path}`,
  generateLabel: () => "Compliance Check",
  environmentRole: "Required",
});
