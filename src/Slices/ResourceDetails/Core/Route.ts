import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    ResourceDetails: { resourceId: string };
  }
}

export const path = "/resources/:resourceId";

export const route = (base: string): Route<"ResourceDetails"> => ({
  kind: "ResourceDetails",
  parent: "Resources",
  path: `${base}${path}`,
  generateLabel: () => "Resource Details",
  environmentRole: "Required",
});
