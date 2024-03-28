import { Route } from "@/Core";

export const path = "/user_management";

export const route = (base: string): Route<"UserManagement"> => ({
  kind: "UserManagement",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => "User Management",
  environmentRole: "Optional",
});
