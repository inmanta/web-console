import { Route, words } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    MarkdownPreviewer: { service: string; instance: string; instanceId: string };
  }
}

export const path = "/lsm/catalog/:service/inventory/:instance/:instanceId/markdownpreview";

export const route = (base: string): Route<"MarkdownPreviewer"> => ({
  kind: "MarkdownPreviewer",
  parent: "InstanceDetails",
  path: `${base}${path}`,
  generateLabel: (params) => words("markdownPreviewer.route.label")(params.instance),
  environmentRole: "Required",
});
