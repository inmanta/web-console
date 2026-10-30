import { UsersIcon } from "@patternfly/react-icons";
import { FeatureModule, words } from "@inmanta/web-console-core";
import * as UserManagement from "@inmanta/web-console-feature-user-management/Slices/UserManagement/Core/Route";
import { userManagementMessages } from "./messages";

/**
 * The user management page. It adds its link to the user menu in the header (the environment
 * selector).
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
  contributions: {
    "header.user.actions": [
      {
        id: "user-management",
        getLabel: () => words("userManagement.title"),
        icon: UsersIcon,
        getUrl: (routeManager) => routeManager.getUrl("UserManagement", undefined),
        // Only for a database session (database auth, or the OIDC/JWT local login fallback).
        // Other auth methods have external user and role management.
        isVisible: (_orchestratorProvider, authHelper) =>
          !authHelper.isDisabled() && authHelper.isDatabaseSession(),
      },
    ],
  },
};
