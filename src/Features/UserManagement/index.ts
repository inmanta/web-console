import { FeatureModule } from "@/Core";
import * as UserManagement from "@S/UserManagement/Core/Route";

/**
 * The user management page, reached from the environment selector in the header.
 */
export const userManagementFeature: FeatureModule = {
  id: "user-management",
  version: APP_VERSION,
  routes: [
    {
      route: UserManagement.route,
      page: () => import("@S/UserManagement/UI/Page").then((module) => module.UserManagementPage),
    },
  ],
};
