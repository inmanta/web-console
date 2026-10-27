import * as Notification from "@S/Notification/Core/Route";
import * as Status from "@S/Status/Core/Route";
import { FeatureModule } from "@inmanta/web-console-core";
import { shellMessages } from "./messages";

/**
 * The pages the header links to: the status page and the notification center. They belong to the
 * shell, not to a feature, so every app registers them.
 */
export const shellFeature: FeatureModule = {
  id: "shell",
  version: APP_VERSION,
  messages: shellMessages,
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
