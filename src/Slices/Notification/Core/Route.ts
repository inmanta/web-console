import { Route } from "@/Core";

declare module "@/Core/Domain/Route" {
  interface RouteRegistry {
    NotificationCenter: undefined;
  }
}

export const path = "/notificationcenter";

export const route = (base: string): Route<"NotificationCenter"> => ({
  kind: "NotificationCenter",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Notification Center",
  environmentRole: "Required",
});
