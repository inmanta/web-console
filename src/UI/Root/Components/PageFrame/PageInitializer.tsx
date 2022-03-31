import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  environment: string;
}

export const PageInitializer: React.FC<Props> = ({ children, environment }) => {
  const { queryResolver } = useContext(DependencyContext);

  const [environmentSettingsData] =
    queryResolver.useOneTime<"GetEnvironmentSettings">({
      kind: "GetEnvironmentSettings",
      environment: environment,
    });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <>{children}</>,
      failed: () => <>{children}</>,
      success: () => <>{children}</>,
    },
    environmentSettingsData
  );
};
