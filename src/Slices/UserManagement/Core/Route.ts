import { Route } from "@/Core";

export const path = "/user_management";

export const route = (base: string): Route<"UserManagement"> => ({
  kind: "UserManagement",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "User Management",
  environmentRole: "Optional",
});
