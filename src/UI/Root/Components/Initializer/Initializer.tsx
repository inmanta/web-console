import React, { useEffect, useContext } from "react";
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
  const { environmentHandler } = useContext(DependencyContext);
  const serverStatus = useGetServerStatus().useOneTime();
  const environments = useGetEnvironments().useOneTime();

  useEffect(() => {
    if (environments.isSuccess) {
      environmentHandler.setAllEnvironments(environments.data);
    }
  }, [environments.data, environments.isSuccess, environmentHandler]);

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

  if (serverStatus.isSuccess && environments.isSuccess) {
    return <>{children}</>;
  }

  return <LoadingView ariaLabel="Initializer-Loading" />;
};
