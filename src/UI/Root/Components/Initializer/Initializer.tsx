import React from "react";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";
import { useGetServerStatus } from "@/Data/Managers/V2/Server/GetServerStatus";
import { ErrorView, LoadingView } from "@/UI/Components";

/**
 * Initializer component
 *
 * @returns {React.FC<React.PropsWithChildren<unknown>>} The Initializer component
 */
export const Initializer: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const serverStatus = useGetServerStatus().useOneTime();
  const environments = useGetEnvironments().useOneTime();

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
