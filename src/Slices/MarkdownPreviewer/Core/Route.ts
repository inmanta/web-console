import { Route } from "@/Core";

export const path = "/lsm/catalog/:service/inventory/:instance/:instanceId/markdownpreview";

export const route = (base: string): Route<"MarkdownPreviewer"> => ({
    kind: "MarkdownPreviewer",
    parent: "InstanceDetails",
    path: `${base}${path}`,
    generateLabel: (params) => `Markdown Preview: ${params.instance}`,
    environmentRole: "Required",
}); 