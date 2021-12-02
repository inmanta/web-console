import React, { useContext } from "react";
import { FlatEnvironment, RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { EnvironmentSettings } from "./EnvironmentSettings";

interface Props {
  environment: FlatEnvironment;
}

export const Tab: React.FC<Props> = ({ environment }) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetProjects">({
    kind: "GetProjects",
  });
  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="EditEnvironment-Loading" />,
      failed: (message) => (
        <ErrorView message={message} aria-label="EditEnvironment-Failed" />
      ),
      success: (projects) => (
        <EnvironmentSettings
          aria-label="Environment-Success"
          environment={environment}
          projects={projects}
        />
      ),
    },
    data
  );
};
