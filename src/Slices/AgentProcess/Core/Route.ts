import { Route } from "@/Core";

export const path = "/agents/:id";

export const route = (base: string): Route<"AgentProcess"> => ({
  kind: "AgentProcess",
  parent: "Agents",
  path: `${base}${path}`,
  generateLabel: () => "Agent Process",
  environmentRole: "Required",
});
