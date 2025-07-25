import React, { useEffect, useContext, useState } from "react";
import { useGetEnvironmentPreview, useGetServerStatus } from "@/Data/Queries";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

/**
 * Initializer component
 *
 * It handles different states of the server status and environments data fetching (loading, error, success)
 * and renders the appropriate UI for each state.
 *
 * @returns {React.FC<React.PropsWithChildren<unknown>>} The Initializer component
 */
export const Initializer: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnvironmentPreviewInitialized, setIsEnvironmentPreviewInitialized] = useState(false);
  const { environmentHandler, orchestratorProvider } = useContext(DependencyContext);
  const serverStatus = useGetServerStatus().useOneTime();
  const EnvironmentPreview = useGetEnvironmentPreview().useOneTime();

  useEffect(() => {
    if (serverStatus.data) {
      orchestratorProvider.setAllFeatures(serverStatus.data);
      setIsInitialized(true); // This is used to sync the component rendering with updating hooks
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStatus.data]);

  useEffect(() => {
    if (EnvironmentPreview.data && EnvironmentPreview.data.environments) {
      environmentHandler.setAllEnvironments(EnvironmentPreview.data.environments);
      setIsEnvironmentPreviewInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [EnvironmentPreview.data]);

  if (serverStatus.isError) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={serverStatus.error.message}
        retry={serverStatus.refetch}
      />
    );
  }

  if (EnvironmentPreview.isError) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={EnvironmentPreview.error.message}
        retry={EnvironmentPreview.refetch}
      />
    );
  }

  if (
    serverStatus.isSuccess &&
    EnvironmentPreview.isSuccess &&
    isInitialized &&
    isEnvironmentPreviewInitialized
  ) {
    return <>{children}</>;
  }

  return <LoadingView ariaLabel="Initializer-Loading" />;
};
