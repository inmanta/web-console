import { FeatureModule } from "@inmanta/web-console-core";
import * as Notification from "@inmanta/web-console-shell/Slices/Notification/Core/Route";
import * as Status from "@inmanta/web-console-shell/Slices/Status/Core/Route";
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
        import("@inmanta/web-console-shell/Slices/Notification/UI/Center").then(
          (module) => module.NotificationCenterPage
        ),
    },
    {
      route: Status.route,
      page: () =>
        import("@inmanta/web-console-shell/Slices/Status/UI").then((module) => module.StatusPage),
    },
  ],
};
