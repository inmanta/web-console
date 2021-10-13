import { RemoteData } from "@/Core";
import React, { useContext } from "react";
import { DependencyContext } from "@/UI/Dependency";
import { LoadingView, ErrorView } from "@/UI/Components";

export const Initializer: React.FC = ({ children }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime({ kind: "GetServerStatus" });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView message={error} />,
      success: (serverStatus) => {
        console.log({ serverStatus });
        return <>{children}</>;
      },
    },
    data
  );
};
