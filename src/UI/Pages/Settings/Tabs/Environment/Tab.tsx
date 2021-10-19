import { RemoteData } from "@/Core";
import { EnvironmentHandlerContext } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import React, { useContext } from "react";
import { EnvironmentSettings } from "./EnvironmentSettings";

export const Tab: React.FC = () => {
  const { environmentHandler } = useContext(EnvironmentHandlerContext);
  const selected = environmentHandler.getSelected();

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="Environment-Loading" />,
      failed: (error) => (
        <ErrorView aria-label="Environment-Failed" message={error} />
      ),
      success: (selectedProjectAndEnvironment) => {
        return (
          <EnvironmentSettings
            aria-label="Environment-Success"
            environment={selectedProjectAndEnvironment.environment}
            project={selectedProjectAndEnvironment.project}
          />
        );
      },
    },
    selected
  );
};
