import React, { useContext } from "react";
import { EnvironmentDetails, FlatEnvironment, ProjectModel } from "@/Core";
import { DependencyContext } from "@/UI";
import { LoadingView, ErrorView } from "@/UI/Components";
import { EnvironmentSettings } from "./EnvironmentSettings";
import {
  useGetEnvironmentDetails,
  useGetProjects,
} from "@/Data/Managers/V2/Environment";

export const Tab: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const id = environmentHandler.useId();

  const projects = useGetProjects().useOneTime();
  const envDetails = useGetEnvironmentDetails().useOneTime(id);

  if (envDetails.isError) {
    return (
      <ErrorView
        message={envDetails.error.message}
        retry={envDetails.refetch}
        ariaLabel="EditEnvironment-Failed"
      />
    );
  }

  if (projects.isError) {
    return (
      <ErrorView
        message={projects.error.message}
        retry={projects.refetch}
        ariaLabel="EditEnvironment-Failed"
      />
    );
  }

  if (envDetails.isSuccess && projects.isSuccess) {
    return (
      <EnvironmentSettings
        aria-label="EditEnvironment-Success"
        environment={addProjectName(envDetails.data, projects.data)}
        projects={projects.data}
      />
    );
  }
  return <LoadingView ariaLabel="EditEnvironment-Loading" />;
};

const addProjectName = (
  env: EnvironmentDetails,
  projects: ProjectModel[],
): FlatEnvironment => {
  const match = projects.find((p) => p.id === env.project_id);

  if (!match) return { ...env, projectName: "" };

  return { ...env, projectName: match.name };
};
