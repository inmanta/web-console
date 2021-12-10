import React, { useContext } from "react";
import {
  EnvironmentDetails,
  FlatEnvironment,
  ProjectModel,
  RemoteData,
} from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { EnvironmentSettings } from "./EnvironmentSettings";

export const Tab: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetProjects">({
    kind: "GetProjects",
    environmentDetails: false,
  });
  const [envData] = queryResolver.useOneTime<"GetEnvironmentDetails">({
    kind: "GetEnvironmentDetails",
    details: true,
  });

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => <LoadingView aria-label="EditEnvironment-Loading" />,
      failed: (message) => (
        <ErrorView message={message} aria-label="EditEnvironment-Failed" />
      ),
      success: ([environmentDetails, projects]) => (
        <EnvironmentSettings
          aria-label="Environment-Success"
          environment={addProjectName(environmentDetails, projects)}
          projects={projects}
        />
      ),
    },
    RemoteData.merge(envData, data)
  );
};

const addProjectName = (
  env: EnvironmentDetails,
  projects: ProjectModel[]
): FlatEnvironment => {
  const match = projects.find((p) => p.id === env.project_id);
  if (!match) return { ...env, projectName: "" };
  return { ...env, projectName: match.name };
};
