import { FeatureModule } from "@inmanta/web-console-core";
import * as UserManagement from "@inmanta/web-console-feature-user-management/Slices/UserManagement/Core/Route";
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
      page: () =>
        import("@inmanta/web-console-feature-user-management/Slices/UserManagement/UI/Page").then(
          (module) => module.UserManagementPage
        ),
    },
  ],
};
