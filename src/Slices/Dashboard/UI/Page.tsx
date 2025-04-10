import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Dashboard } from "./Dashboard";
import { useGetEnvironmentDetails } from "@/Data/Managers/V2/Environment";

export const Page: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);

  const {
    data: envData,
    refetch,
    isError,
    isSuccess,
    error,
  } = useGetEnvironmentDetails().useOneTime(environmentHandler.useId());

  if (isError) {
    return <ErrorView message={error.message} retry={refetch} ariaLabel="Dashboard-Failed" />;
  }
  if (isSuccess) {
    return (
      <PageContainer
        pageTitle={words("dashboard.title")(envData.name)}
        aria-label="Dashboard-Success"
      >
        <Dashboard />
      </PageContainer>
    );
  }
  return <LoadingView ariaLabel="Dashboard-Loading" />;
};
