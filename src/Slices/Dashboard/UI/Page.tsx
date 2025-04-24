import React, { useContext } from "react";
import { useGetEnvironmentDetails } from "@/Data/Managers/V2/Environment/GetEnvironmentDetails/useGetEnvironmentDetails";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { Dashboard } from "./Dashboard";

/**
 * Dashboard page
 *
 * It handles different states of the project data fetching for Dashboard page (loading, error, success)
 * and renders the appropriate UI for each state.
 *
 * @returns {React.FC} The Dashboard page
 */
export const Page: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);

  const { isSuccess, isError, error, refetch } = useGetEnvironmentDetails().useOneTime(
    environmentHandler.useId()
  );

  if (isError) {
    return (
      <PageContainer pageTitle={"Dashboard"}>
        <ErrorView message={error.message} retry={refetch} ariaLabel="Dashboard-Failed" />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={"Dashboard"}>
        <Dashboard />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={"Dashboard"}>
      <LoadingView ariaLabel="Dashboard-Loading" />
    </PageContainer>
  );
};
