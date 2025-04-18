import React from "react";
import { PageSection } from "@patternfly/react-core";
import { Environment } from "@/Core";
import { useGetEnvironments, useGetProjects } from "@/Data/Managers/V2/Environment";
import { words } from "@/UI";
import { ErrorView, LoadingView, PageSectionWithTitle } from "@/UI/Components";
import { EnvironmentsOverview } from "./EnvironmentsOverview";
import { EmptyFilterToolbar } from "./FilterToolbar";

export const Page: React.FC = () => {
  const { data, isError, error, isSuccess, refetch } = useGetEnvironments().useContinuous(true);
  const projects = useGetProjects().useOneTime();

  if (isError) {
    return (
      <>
        <PageSectionWithTitle title={words("home.title")} />
        <EmptyFilterToolbar />
        <PageSection hasBodyWrapper={false}>
          <ErrorView
            title={words("error")}
            message={words("error.general")(error.message)}
            retry={refetch}
            ariaLabel="Overview-Failed"
          />
        </PageSection>
      </>
    );
  }

  if (isSuccess && projects.isSuccess) {
    const envsWithProjectName: Environment[] = data.map((env) => ({
      ...env,
      projectName: projects.data.find((project) => project.id === env.project_id)?.name || "",
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
