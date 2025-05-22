import React from "react";
import { useGetProjects } from "@/Data/Queries/Slices/Project/GetProjects";
import { words } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { CreateEnvironmentForm } from "./CreateEnvironmentForm";

/**
 * Create Environment page
 *
 * It handles different states of the project data fetching for Create Environment form (loading, error, success)
 * and renders the appropriate UI for each state.
 *
 * @returns {React.FC} The Create Environment page
 */
export const Page: React.FC = () => {
  const { data, isSuccess, isError, error, refetch } = useGetProjects().useOneTime();

  if (isError) {
    return (
      <PageContainer pageTitle={words("home.create.env")}>
        <ErrorView message={error.message} ariaLabel="CreateEnvironment-Error" retry={refetch} />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("home.create.env")}>
        <CreateEnvironmentForm projects={data} aria-label="CreateEnvironment-Success" />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("home.create.env")}>
      <LoadingView ariaLabel="CreateEnvironment-Loading" />,
    </PageContainer>
  );
};
