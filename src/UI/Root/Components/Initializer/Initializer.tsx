import React, { useEffect, useContext, useState } from "react";
import { CustomError } from "@/Data/Queries/Helpers";
import { useGetEnvironmentPreview } from "@/Data/Queries/Slices/Environment";
import { useGetServerStatus } from "@/Data/Queries/Slices/Server";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
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
  const { environmentHandler, orchestratorProvider, authHelper } = useContext(DependencyContext);
  const serverStatus = useGetServerStatus().useOneTime();
  const EnvironmentPreview = useGetEnvironmentPreview().useContinuous();
  const logout = authHelper.isDisabled() ? undefined : () => authHelper.logout();
  const shouldOfferRetry = (error: CustomError) => error.status !== 403 || logout === undefined;

  useEffect(() => {
    if (serverStatus.data) {
      orchestratorProvider.setAllFeatures(serverStatus.data);
      document.title = serverStatus.data.product;
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

  // Notify the header status indicator of background refetch failures (e.g. on window focus),
  // without tearing down the shell, once both queries have loaded successfully at least once.
  useEffect(() => {
    if (isInitialized && isEnvironmentPreviewInitialized) {
      const hasError = serverStatus.isError || EnvironmentPreview.isError;

      document.dispatchEvent(new CustomEvent(hasError ? "status-down" : "status-up"));
    }
  }, [
    serverStatus.isError,
    EnvironmentPreview.isError,
    isInitialized,
    isEnvironmentPreviewInitialized,
  ]);

  // Only treat these as fatal if they have never loaded successfully. Once we have
  // last-known-good data, a later background refetch failure shouldn't blank the shell.
  // The header with its Logout item isn't rendered yet. Retrying a 403 can't succeed, so Logout
  // replaces Retry there, unless auth is disabled and Retry is the only way out.
  if (serverStatus.isError && !isInitialized) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={serverStatus.error.message}
        retry={shouldOfferRetry(serverStatus.error) ? serverStatus.refetch : undefined}
        logout={logout}
      />
    );
  }

  if (EnvironmentPreview.isError && !isEnvironmentPreviewInitialized) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={EnvironmentPreview.error.message}
        retry={shouldOfferRetry(EnvironmentPreview.error) ? EnvironmentPreview.refetch : undefined}
        logout={logout}
      />
    );
  }

  if (isInitialized && isEnvironmentPreviewInitialized) {
    return <>{children}</>;
  }

  return <LoadingView ariaLabel="Initializer-Loading" />;
};
