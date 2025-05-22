import React, { useEffect, useContext, useState } from "react";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";
import { useGetServerStatus } from "@/Data/Managers/V2/Server/GetServerStatus";
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
  const [initialized, setInitialized] = useState(false);
  const { environmentHandler, featureManager } = useContext(DependencyContext);
  const serverStatus = useGetServerStatus().useOneTime();
  const environments = useGetEnvironments().useOneTime();

  useEffect(() => {
    if (environments.isSuccess && serverStatus.isSuccess) {
      environmentHandler.setAllEnvironments(environments.data);
      featureManager.setAllFeatures(serverStatus.data);
      setInitialized(true); // This is used to sync the component rendering with updating hooks
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environments.data, environments.isSuccess, serverStatus.data, serverStatus.isSuccess]);

  if (serverStatus.isError) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={serverStatus.error.message}
        retry={serverStatus.refetch}
      />
    );
  }

  if (environments.isError) {
    return (
      <ErrorView
        ariaLabel="Initializer-Error"
        message={environments.error.message}
        retry={environments.refetch}
      />
    );
  }

  if (serverStatus.isSuccess && environments.isSuccess && initialized) {
    return <>{children}</>;
  }

  return <LoadingView ariaLabel="Initializer-Loading" />;
};
