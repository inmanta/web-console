import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    CompileReports: undefined;
  }
}

export const path = "/compilereports";

export const route = (base: string): Route<"CompileReports"> => ({
  kind: "CompileReports",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Compile Reports",
  environmentRole: "Required",
});
