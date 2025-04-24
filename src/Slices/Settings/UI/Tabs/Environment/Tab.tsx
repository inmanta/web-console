import React, { useContext } from "react";
import { EnvironmentDetails, FlatEnvironment, ProjectModel } from "@/Core";
import { useGetEnvironmentDetails } from "@/Data/Managers/V2/Environment/GetEnvironmentDetails/useGetEnvironmentDetails";
import { useGetProjects } from "@/Data/Managers/V2/Project/GetProjects";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView } from "@/UI/Components";
import { EnvironmentSettings } from "./EnvironmentSettings";

/**
 * Environment tab for the Settings page
 *
 * It handles different states of the environment settings and project data (loading, error, success)
 * and renders the appropriate UI for each state.
 *
 * @returns {React.FC} The Environment tab
 */
export const Tab: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const projectsData = useGetProjects().useOneTime();

  const id = environmentHandler.useId();

  const envDetailsData = useGetEnvironmentDetails().useOneTime(id);

  if (envDetailsData.isError) {
    return (
      <ErrorView
        message={envDetailsData.error.message}
        retry={envDetailsData.refetch}
        ariaLabel="EnvironmentDetails-Error"
      />
    );
  }
  if (projectsData.isError) {
    return (
      <ErrorView
        message={projectsData.error.message}
        retry={projectsData.refetch}
        ariaLabel="EnvironmentDetails-Error"
      />
    );
  }

  if (envDetailsData.isSuccess && projectsData.isSuccess) {
    return (
      <EnvironmentSettings
        environment={addProjectName(envDetailsData.data, projectsData.data)}
        projects={projectsData.data}
        aria-label="Environment-Success"
      />
    );
  }

  return <LoadingView ariaLabel="Environment-Loading" />;
};

const addProjectName = (env: EnvironmentDetails, projects: ProjectModel[]): FlatEnvironment => {
  const match = projects.find((p) => p.id === env.project_id);

  if (!match) return { ...env, projectName: "" };

  return { ...env, projectName: match.name };
};
