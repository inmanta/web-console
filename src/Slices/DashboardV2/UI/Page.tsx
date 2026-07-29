import React, { useContext } from "react";
import { useGetEnvironmentDetails } from "@/Data/Queries";
import { words } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { DashboardV2 } from "./DashboardV2";

/**
 * Dashboard V2 page
 *
 * Handles the loading/error/success states of the environment-details fetch (needed for the
 * page title), then renders the DashboardV2 body.
 */
export const Page: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);

  const { isSuccess, isError, error, refetch } = useGetEnvironmentDetails().useOneTime(
    environmentHandler.useId()
  );

  if (isError) {
    return (
      <PageContainer pageTitle={words("dashboardV2.title")}>
        <ErrorView message={error.message} retry={refetch} ariaLabel="DashboardV2-Failed" />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("dashboardV2.title")}>
        <DashboardV2 />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("dashboardV2.title")}>
      <LoadingView ariaLabel="DashboardV2-Loading" />
    </PageContainer>
  );
};
