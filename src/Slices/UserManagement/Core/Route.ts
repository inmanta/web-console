import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    UserManagement: undefined;
  }
}

export const path = "/user_management";

export const route = (base: string): Route<"UserManagement"> => ({
  kind: "UserManagement",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "User Management",
  environmentRole: "Optional",
});
