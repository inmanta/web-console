import React, { useEffect, useContext, useState } from "react";
import { useGetPartialEnvironments, useGetServerStatus } from "@/Data/Queries";
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
  const { environmentHandler, featureManager } = useContext(DependencyContext);
  const serverStatus = useGetServerStatus().useOneTime();
  const partialEnvironments = useGetPartialEnvironments().useOneTime();

  useEffect(() => {
    if (serverStatus.data && partialEnvironments.data && partialEnvironments.data.environments) {
      environmentHandler.setAllEnvironments(partialEnvironments.data.environments);
      featureManager.setAllFeatures(serverStatus.data);
      setIsInitialized(true); // This is used to sync the component rendering with updating hooks
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverStatus.data, partialEnvironments.data]);

  if (serverStatus.isError) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={serverStatus.error.message}
        retry={serverStatus.refetch}
      />
    );
  }

  if (partialEnvironments.isError) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={partialEnvironments.error.message}
        retry={partialEnvironments.refetch}
      />
    );
  }

  if (serverStatus.isSuccess && partialEnvironments.isSuccess && isInitialized) {
    return <>{children}</>;
  }

  return <LoadingView ariaLabel="Initializer-Loading" />;
};
