import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { LoadingView, ErrorView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const Initializer: React.FC = ({ children }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetServerStatus">({
    kind: "GetServerStatus",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView />,
      failed: (error) => <ErrorView message={error} />,
      success: () => <>{children}</>,
    },
    data
  );
};
