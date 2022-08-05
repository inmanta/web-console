import { Route } from "@/Core";

export const path = "/desiredstate/:version/resource/:resourceId";

export const route = (base: string): Route<"DesiredStateResourceDetails"> => ({
  kind: "DesiredStateResourceDetails",
  parent: "DesiredStateDetails",
  path: `${base}${path}`,
  generateLabel: () => "Resource Details",
  environmentRole: "Required",
});
