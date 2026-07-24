import { Route } from "@/Core";

export const path = "/compilereports";

export const route = (base: string): Route<"CompileReports"> => ({
  kind: "CompileReports",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Compile Reports",
  environmentRole: "Required",
});
