import { FeatureModule } from "@inmanta/web-console-core";
import * as CreateEnvironment from "@inmanta/web-console-feature-environment/Slices/CreateEnvironment/Core/Route";
import * as Dashboard from "@inmanta/web-console-feature-environment/Slices/Dashboard/Core/Route";
import * as Settings from "@inmanta/web-console-feature-environment/Slices/Settings/Core/Route";
import { environmentMessages } from "./messages";

/**
 * The environment pages: the dashboard, the environment settings and creating an environment.
 * The shell links to `Dashboard` and `CreateEnvironment` without checking `routeManager.has`,
 * so every app registers this feature.
 */
export const environmentFeature: FeatureModule = {
  id: "environment",
  version: APP_VERSION,
  messages: environmentMessages,
  routes: [
    {
      route: CreateEnvironment.route,
      page: () =>
        import("@inmanta/web-console-feature-environment/Slices/CreateEnvironment/UI").then(
          (module) => module.CreateEnvironmentPage
        ),
    },
    {
      route: Settings.route,
      page: () =>
        import("@inmanta/web-console-feature-environment/Slices/Settings/UI").then(
          (module) => module.SettingsPage
        ),
    },
    {
      route: Dashboard.route,
      page: () =>
        import("@inmanta/web-console-feature-environment/Slices/Dashboard/UI").then(
          (module) => module.DashboardPage
        ),
    },
  ],
  navigation: [
    { kind: "Dashboard", group: "environment" },
    { kind: "Settings", group: "environment" },
  ],
};
