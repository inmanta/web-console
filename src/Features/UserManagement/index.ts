import * as UserManagement from "@S/UserManagement/Core/Route";
import { FeatureModule } from "@inmanta/web-console-core";
import { userManagementMessages } from "./messages";

/**
 * The user management page, reached from the environment selector in the header.
 */
export const userManagementFeature: FeatureModule = {
  id: "user-management",
  version: APP_VERSION,
  messages: userManagementMessages,
  routes: [
    {
      route: UserManagement.route,
      page: () => import("@S/UserManagement/UI/Page").then((module) => module.UserManagementPage),
    },
  ],
};
