import React from "react";
import {
  FeatureModule,
  FlatEnvironment,
  getFeatureRoutes,
  RouteFactory,
} from "@inmanta/web-console-core";
import { AuthContextInterface, defaultAuthContext } from "@inmanta/web-console-core/Auth";
import { PrimaryArchiveHelper } from "@inmanta/web-console-core/Common";
import { DependencyProvider } from "@inmanta/web-console-core/Dependency";
import { EnvironmentPreview } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { AppAlertProvider } from "@inmanta/web-console-shell/Components/AppAlertProvider";
import { EnvironmentDetails } from "@inmanta/web-console-test-utils/Data";
import {
  MockEnvironmentHandler,
  MockOrchestratorProvider,
  MockFileManager,
} from "@inmanta/web-console-test-utils/Mock";
import { UrlManagerImpl } from "@inmanta/web-console-ui/Utils";

interface Props {
  env?: FlatEnvironment;
  authHelper?: AuthContextInterface;
  isCompiling?: boolean;
  allEnvironments?: EnvironmentPreview[];

  /**
   * The features of the app. Defaults to none: pass the features whose pages the test links to,
   * and `stubRoute` for pages of other features.
   */
  features?: FeatureModule[];

  /**
   * The registered routes. Defaults to the routes of `features`.
   */
  routes?: RouteFactory[];
}

/**
 * MockedDependencyProvider is a component that provides the dependencies for the tested component.
 *
 * @returns {React.FC<React.PropsWithChildren<Props>>}
 */
export const MockedDependencyProvider: React.FC<React.PropsWithChildren<Props>> = ({
  env = EnvironmentDetails.env,
  authHelper = defaultAuthContext,
  isCompiling = false,
  allEnvironments = [],
  features = [],
  routes = getFeatureRoutes(features),
  children,
}) => {
  const baseUrl = "";
  const routeManager = PrimaryRouteManager(baseUrl, routes);
  const environmentHandler = MockEnvironmentHandler(env, isCompiling, allEnvironments);
  const orchestratorProvider = new MockOrchestratorProvider();
  const urlManager = new UrlManagerImpl(orchestratorProvider, baseUrl);
  const fileManager = new MockFileManager();
  const archiveHelper = new PrimaryArchiveHelper(fileManager);

  return (
    <DependencyProvider
      dependencies={{
        routeManager,
        orchestratorProvider,
        urlManager,
        environmentHandler,
        archiveHelper,
        authHelper,
        features,
      }}
    >
      <AppAlertProvider>{children}</AppAlertProvider>
    </DependencyProvider>
  );
};
