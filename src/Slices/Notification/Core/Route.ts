import { Route } from "@/Core";

export const path = "/notificationcenter";

export const route = (base: string): Route<"NotificationCenter"> => ({
  kind: "NotificationCenter",
  parent: "Dashboard",
  path: `${base}${path}`,
  generateLabel: () => "Notification Center",
  environmentRole: "Required",
});
