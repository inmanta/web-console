import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";

export const Initializer: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [statusData] = queryResolver.useOneTime<"GetServerStatus">({
    kind: "GetServerStatus",
  });

  const [environmentsData] = queryResolver.useOneTime<"GetEnvironments">({
    kind: "GetEnvironments",
    details: false,
  });

  return (
    <RemoteDataView
      data={RemoteData.merge(statusData, environmentsData)}
      SuccessView={() => <>{children}</>}
    />
  );
};
