import { FeatureModule } from "@/Core";
import * as Notification from "@S/Notification/Core/Route";
import * as Status from "@S/Status/Core/Route";

/**
 * The pages the header links to: the status page and the notification center. They belong to the
 * shell, not to a feature, so every app registers them.
 */
export const shellFeature: FeatureModule = {
  id: "shell",
  version: APP_VERSION,
  routes: [
    {
      route: Notification.route,
      page: () =>
        import("@S/Notification/UI/Center").then((module) => module.NotificationCenterPage),
    },
    {
      route: Status.route,
      page: () => import("@S/Status/UI").then((module) => module.StatusPage),
    },
  ],
};
