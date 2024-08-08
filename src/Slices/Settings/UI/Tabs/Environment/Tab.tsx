import React, { useContext } from "react";
import {
  EnvironmentDetails,
  FlatEnvironment,
  ProjectModel,
  RemoteData,
} from "@/Core";
import { DependencyContext } from "@/UI";
import { RemoteDataView } from "@/UI/Components";
import { EnvironmentSettings } from "./EnvironmentSettings";

export const Tab: React.FC = () => {
  const { queryResolver, environmentHandler } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetProjects">({
    kind: "GetProjects",
    environmentDetails: false,
  });

  const id = environmentHandler.useId();
  const [envData] = queryResolver.useOneTime<"GetEnvironmentDetails">({
    kind: "GetEnvironmentDetails",
    details: true,
    id,
  });

  return (
    <RemoteDataView
      data={RemoteData.merge(envData, data)}
      label="EditEnvironment"
      SuccessView={([environmentDetails, projects]) => (
        <EnvironmentSettings
          aria-label="Environment-Success"
          environment={addProjectName(environmentDetails, projects)}
          projects={projects}
        />
      )}
    />
  );
};

const addProjectName = (
  env: EnvironmentDetails,
  projects: ProjectModel[],
): FlatEnvironment => {
  const match = projects.find((p) => p.id === env.project_id);
  if (!match) return { ...env, projectName: "" };
  return { ...env, projectName: match.name };
};
