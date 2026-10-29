import React, { useContext } from "react";
import { FlatEnvironment, ProjectModel } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useGetEnvironmentDetails } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { useGetProjects } from "@inmanta/web-console-core/Queries/Slices/Project";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
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

  if (envDetailsData.isError || projectsData.isError) {
    return (
      <ErrorView
        message={envDetailsData.error?.message || projectsData.error?.message || ""}
        retry={(envDetailsData.isError && envDetailsData.refetch) || projectsData.refetch}
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

const addProjectName = (env: FlatEnvironment, projects: ProjectModel[]): FlatEnvironment => {
  const match = projects.find((p) => p.id === env.project_id);

  if (!match) {
    return { ...env, projectName: "" };
  }

  return { ...env, projectName: match.name };
};
