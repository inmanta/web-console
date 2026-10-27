import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    CompileDetails: { id: string };
  }
}

export const path = "/compilereports/:id";

export const route = (base: string): Route<"CompileDetails"> => ({
  kind: "CompileDetails",
  parent: "CompileReports",
  path: `${base}${path}`,
  generateLabel: () => "Compile Details",
  environmentRole: "Required",
});
