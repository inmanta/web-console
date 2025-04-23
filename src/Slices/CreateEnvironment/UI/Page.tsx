import React from "react";
import { useGetProjects } from "@/Data/Managers/V2/Project/GetProjects/useGetProjects";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { CreateEnvironmentForm } from "./CreateEnvironmentForm";

export const Page: React.FC = () => {
  const { data, isSuccess, isError, error, refetch } = useGetProjects().useOneTime();

  if (isError) {
    return (
      <PageContainer pageTitle={"Create Environment"}>
        <ErrorView message={error.message} ariaLabel="CreateEnvironment-Error" retry={refetch} />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={"Create Environment"}>
        <CreateEnvironmentForm projects={data} aria-label="CreateEnvironment-Success" />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={"Create Environment"}>
      <LoadingView ariaLabel="CreateEnvironment-Loading" />,
    </PageContainer>
  );
};
