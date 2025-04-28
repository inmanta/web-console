import React from "react";
import { FileFetcher, FlatEnvironment } from "@/Core";
import { PrimaryArchiveHelper, defaultAuthContext } from "@/Data";
import { MockEnvironmentHandler, MockFeatureManager, MockFileManager } from "@/Test/Mock";
import { PrimaryRouteManager, useEnvironmentModifierImpl, DependencyProvider } from "@/UI";
import { UrlManagerImpl } from "@/UI/Utils";
import { EnvironmentDetails } from "../Data";

export const MockedDependencyProvider: React.FC<
  React.PropsWithChildren<{
    env?: FlatEnvironment;
    fileFetcher?: FileFetcher;
  }>
> = ({ env = EnvironmentDetails.env, fileFetcher, children }) => {
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
        authHelper: defaultAuthContext,
      }}
    >
      {children}
    </DependencyProvider>
  );
};
