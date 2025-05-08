import React from "react";
import { FileFetcher, FlatEnvironment } from "@/Core";
import { AuthContextInterface, PrimaryArchiveHelper, defaultAuthContext } from "@/Data";
import { EnvironmentDetails } from "@/Test";
import { MockEnvironmentHandler, MockFeatureManager, MockFileManager } from "@/Test/Mock";
import { DependencyProvider, useEnvironmentModifierImpl } from "@/UI/Dependency";
import { PrimaryRouteManager } from "@/UI/Routing";
import { UrlManagerImpl } from "@/UI/Utils";

interface Props {
  env?: FlatEnvironment;
  fileFetcher?: FileFetcher;
  authHelper?: AuthContextInterface;
}

/**
 * MockedDependencyProvider is a component that provides the dependencies for the tested component.
 *
 * @returns {React.FC<React.PropsWithChildren<Props>}
 */
export const MockedDependencyProvider: React.FC<React.PropsWithChildren<Props>> = ({
  env = EnvironmentDetails.env,
  fileFetcher,
  authHelper = defaultAuthContext,
  children,
}) => {
  const baseUrl = "";
  const routeManager = PrimaryRouteManager(baseUrl);
  const environmentHandler = MockEnvironmentHandler(env);
  const featureManager = new MockFeatureManager();
  const environmentModifier = useEnvironmentModifierImpl();
  const urlManager = new UrlManagerImpl(featureManager, baseUrl);
  const fileManager = new MockFileManager();
  const archiveHelper = new PrimaryArchiveHelper(fileManager);

  return (
    <DependencyProvider
      dependencies={{
        routeManager,
        featureManager,
        environmentModifier,
        urlManager,
        environmentHandler,
        archiveHelper,
        fileFetcher,
        authHelper,
      }}
    >
      {children}
    </DependencyProvider>
  );
};
