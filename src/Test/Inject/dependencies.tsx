import React from "react";
import { FlatEnvironment } from "@/Core";
import { AuthContextInterface, PrimaryArchiveHelper, defaultAuthContext } from "@/Data";
import { EnvironmentPreview } from "@/Data/Queries";
import { EnvironmentDetails } from "@/Test";
import { MockEnvironmentHandler, MockOrchestratorProvider, MockFileManager } from "@/Test/Mock";
import { DependencyProvider } from "@/UI/Dependency";
import { AppAlertProvider } from "@/UI/Root/Components/AppAlertProvider";
import { PrimaryRouteManager } from "@/UI/Routing";
import { UrlManagerImpl } from "@/UI/Utils";

interface Props {
  env?: FlatEnvironment;
  authHelper?: AuthContextInterface;
  isCompiling?: boolean;
  allEnvironments?: EnvironmentPreview[];
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
  children,
}) => {
  const baseUrl = "";
  const routeManager = PrimaryRouteManager(baseUrl);
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
      }}
    >
      <AppAlertProvider>{children}</AppAlertProvider>
    </DependencyProvider>
  );
};
