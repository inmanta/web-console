import { Route } from "@/Core";

export const path = "/user_management/roles/:username";

export const route = (base: string): Route<"RoleManagement"> => ({
  kind: "RoleManagement",
  parent: "UserManagement",
  path: `${base}${path}`,
  generateLabel: (params) => `Role Management: ${params.username}`,
  environmentRole: "Optional",
});
