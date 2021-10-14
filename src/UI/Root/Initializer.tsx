import { RemoteData } from "@/Core";
import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { LoadingView, ErrorView } from "@/UI/Components";

export const Initializer: React.FC = ({ children }) => {
  const { queryResolver, featureManager } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetServerStatus">({
    kind: "GetServerStatus",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView message={error} />,
      success: (serverStatus) => {
        featureManager.setServerStatus(serverStatus);
        return <>{children}</>;
      },
    },
    data
  );
};
