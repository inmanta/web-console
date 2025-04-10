import React, { useContext, useEffect, useState } from "react";
import { useGetEnvironments } from "@/Data/Managers/V2/Environment";
import { useGetServerStatus } from "@/Data/Managers/V2/Server/GetServerStatus";
import { ErrorView, LoadingView } from "@/UI/Components";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";

export const Initializer: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const getServerStatus = useGetServerStatus().useOneTime();
  const getEnvironments = useGetEnvironments().useOneTime();
  const { featureManager } = useContext(DependencyContext);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Only set the server status once, and turn off the loading view, temp solution
    if (getServerStatus.isSuccess && !shouldRender) {
      featureManager.set(getServerStatus.data);
      setShouldRender(true);
    }
  }, [getServerStatus.isSuccess]);

  if (getEnvironments.isError) {
    return (
      <ErrorView
        title={words("error")}
        message={words("error.general")(getEnvironments.error.message)}
        retry={getEnvironments.refetch}
      />
    );
  }

  if (getServerStatus.isError) {
    return (
      <ErrorView
        title={words("error")}
        message={words("error.general")(getServerStatus.error.message)}
        retry={getServerStatus.refetch}
      />
    );
  }
  if (getEnvironments.isSuccess && getServerStatus.isSuccess && shouldRender) {
    return <>{children}</>;
  }

  return <LoadingView />;
};
