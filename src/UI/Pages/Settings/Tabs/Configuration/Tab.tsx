import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { Container } from "./Container";

export const Tab: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [settings] = queryResolver.useOneTime<"GetEnvironmentSettings">({
    kind: "GetEnvironmentSettings",
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="EnvironmentSettings-Loading" />,
      failed: (error) => (
        <ErrorView aria-label="EnvironmentSettings-Failed" message={error} />
      ),
      success: (settings) => <Container settings={settings} />,
    },
    settings
  );
};
