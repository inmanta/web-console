import React from "react";
import { FeatureModule, FlatEnvironment, getFeatureRoutes, RouteFactory } from "@/Core";
import { AuthContextInterface, defaultAuthContext } from "@/Data/Auth";
import { PrimaryArchiveHelper } from "@/Data/Common";
import { EnvironmentPreview } from "@/Data/Queries/Slices/Environment";
import { EnvironmentDetails } from "@/Test/Data";
import { MockEnvironmentHandler, MockOrchestratorProvider, MockFileManager } from "@/Test/Mock";
import { DependencyProvider } from "@/UI/Dependency";
import { AppAlertProvider } from "@/UI/Root/Components/AppAlertProvider";
import { PrimaryRouteManager } from "@/UI/Routing/PrimaryRouteManager";
import { UrlManagerImpl } from "@/UI/Utils";
import { features as appFeatures } from "@/appFeatures";

interface Props {
  env?: FlatEnvironment;
  authHelper?: AuthContextInterface;
  isCompiling?: boolean;
  allEnvironments?: EnvironmentPreview[];

  /**
   * The features of the app. Defaults to every feature the app ships.
   */
  features?: FeatureModule[];

  /**
   * The registered routes. Defaults to the routes of `features`.
   */
  routes?: RouteFactory[];
}

/**
 * Returns the features the app ships, without one of them, e.g. to test the app without the
 * composer.
 *
 * @param id - the id of the feature to leave out
 * @returns every other feature of the app
 */
export const withoutFeature = (id: string): FeatureModule[] =>
  appFeatures.filter((feature) => feature.id !== id);

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
  features = appFeatures,
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
