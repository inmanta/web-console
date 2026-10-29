import React, { useContext } from "react";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useGetEnvironmentDetails } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
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
