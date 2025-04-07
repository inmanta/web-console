import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Provider } from "./Provider";

interface Props {
  environmentId: string;
}

export const Tab: React.FC<Props> = ({ environmentId }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [settings] = queryResolver.useOneTime<"GetEnvironmentSettings">({
    kind: "GetEnvironmentSettings",
    environment: environmentId,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView ariaLabel="EnvironmentSettings-Loading" />,
      failed: (error) => <ErrorView ariaLabel="EnvironmentSettings-Failed" message={error} />,
      success: (settings) => <Provider settings={settings} />,
    },
    settings
  );
};
