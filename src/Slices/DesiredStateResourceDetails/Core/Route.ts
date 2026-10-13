import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    DesiredStateResourceDetails: { version: string; resourceId: string };
  }
}

export const path = "/desiredstate/:version/resource/:resourceId";

export const route = (base: string): Route<"DesiredStateResourceDetails"> => ({
  kind: "DesiredStateResourceDetails",
  parent: "DesiredStateDetails",
  path: `${base}${path}`,
  generateLabel: () => "Resource Details",
  environmentRole: "Required",
});
