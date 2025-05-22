import React from "react";
import { PageSection } from "@patternfly/react-core";
import { Environment } from "@/Core";
import { useGetEnvironments } from "@/Data/Queries/V2/Environment/GetEnvironments";
import { useGetProjects } from "@/Data/Queries/V2/Project/GetProjects";
import { words } from "@/UI";
import { ErrorView, LoadingView, PageSectionWithTitle } from "@/UI/Components";
import { EnvironmentsOverview } from "./EnvironmentsOverview";
import { EmptyFilterToolbar } from "./FilterToolbar";

/**
 * Home page
 *
 * It handles different states of the environment data fetching for Home page (loading, error, success)
 * and renders the appropriate UI for each state.
 *
 * @returns {React.FC} The Home page
 */
export const Page: React.FC = () => {
  const { data, isSuccess, isError, error, refetch } = useGetEnvironments().useContinuous();
  const projects = useGetProjects().useContinuous();

  if (isError) {
    return (
      <>
        <PageSectionWithTitle title={words("home.title")} />
        <EmptyFilterToolbar />
        <PageSection hasBodyWrapper={false}>
          <ErrorView
            title={words("error")}
            message={words("error.general")(error.message)}
            ariaLabel="Overview-Failed"
            retry={refetch}
          />
        </PageSection>
      </>
    );
  }
  if (projects.isError) {
    return (
      <>
        <PageSectionWithTitle title={words("home.title")} />
        <EmptyFilterToolbar />
        <PageSection hasBodyWrapper={false}>
          <ErrorView
            title={words("error")}
            message={words("error.general")(projects.error.message)}
            ariaLabel="Overview-Failed"
            retry={refetch}
          />
        </PageSection>
      </>
    );
  }

  if (isSuccess && projects.isSuccess) {
    const projectMap = new Map(projects.data.map((project) => [project.id, project.name]));
    const envsWithProjectName: Environment[] = data.map((env) => ({
      ...env,
      projectName: projectMap.get(env.project_id) || "",
    }));

    return (
      <>
        <PageSectionWithTitle title={words("home.title")} />
        <EnvironmentsOverview environments={envsWithProjectName} aria-label="Overview-Success" />
      </>
    );
  }

  return (
    <>
      <PageSectionWithTitle title={words("home.title")} />
      <EmptyFilterToolbar />
      <PageSection hasBodyWrapper={false}>
        <LoadingView ariaLabel="Overview-Loading" />
      </PageSection>
    </>
  );
};
