import React from "react";
import { FlatEnvironment } from "@/Core";
import { AuthContextInterface, PrimaryArchiveHelper, defaultAuthContext } from "@/Data";
import { EnvironmentDetails } from "@/Test";
import { MockEnvironmentHandler, MockFeatureManager, MockFileManager } from "@/Test/Mock";
import { DependencyProvider } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { UrlManagerImpl } from "@/UI/Utils";

interface Props {
  env?: FlatEnvironment;
  authHelper?: AuthContextInterface;
}

/**
 * MockedDependencyProvider is a component that provides the dependencies for the tested component.
 *
 * @returns {React.FC<React.PropsWithChildren<Props>>}
 */
export const MockedDependencyProvider: React.FC<React.PropsWithChildren<Props>> = ({
  env = EnvironmentDetails.env,
  authHelper = defaultAuthContext,
  children,
}) => {
  const baseUrl = "";
  const routeManager = PrimaryRouteManager(baseUrl);
  const environmentHandler = MockEnvironmentHandler(env);
  const featureManager = new MockFeatureManager();
  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const fileManager = new MockFileManager();
  const archiveHelper = new PrimaryArchiveHelper(fileManager);

  return (
    <DependencyProvider
      dependencies={{
        routeManager,
        featureManager,
        urlManager,
        environmentHandler,
        archiveHelper,
        authHelper,
      }}
    >
      {children}
    </DependencyProvider>
  );
};
