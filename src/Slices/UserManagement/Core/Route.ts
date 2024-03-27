import { Route } from "@/Core";
import { words } from "@/UI";

export const path = "/user_management";

export const route = (base: string): Route<"UserManagement"> => ({
  kind: "UserManagement",
  parent: "Home",
  path: `${base}${path}`,
  generateLabel: () => words("userManagement.title"),
  environmentRole: "Optional",
});
