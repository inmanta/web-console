import React, { useContext } from "react";
import { useGetEnvironmentDetails } from "@/Data/Queries/Slices/Environment";
import { ErrorView } from "@/UI/Components/ErrorView";
import { LoadingView } from "@/UI/Components/LoadingView";
import { PageContainer } from "@/UI/Components/PageContainer";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Dashboard } from "./Dashboard";

/**
 * Dashboard page
 *
 * Handles the loading/error/success states of the environment-details fetch (needed for the
 * page title), then renders the Dashboard body.
 */
export const Page: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);

  const { isSuccess, isError, error, refetch } = useGetEnvironmentDetails().useOneTime(
    environmentHandler.useId()
  );

  if (isError) {
    return (
      <PageContainer pageTitle={words("dashboard.title")}>
        <ErrorView message={error.message} retry={refetch} ariaLabel="Dashboard-Failed" />
      </PageContainer>
    );
  }

  if (isSuccess) {
    return (
      <PageContainer pageTitle={words("dashboard.title")}>
        <Dashboard />
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle={words("dashboard.title")}>
      <LoadingView ariaLabel="Dashboard-Loading" />
    </PageContainer>
  );
};
