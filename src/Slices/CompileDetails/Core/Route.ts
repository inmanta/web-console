import { Route } from "@/Core";

export const path = "/compilereports/:id";

export const route = (base: string): Route<"CompileDetails"> => ({
  kind: "CompileDetails",
  parent: "CompileReports",
  path: `${base}${path}`,
  generateLabel: () => "Compile Details",
  environmentRole: "Required",
});
