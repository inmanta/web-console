import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { DependencyContext } from "@/UI";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { CreateEnvironmentForm } from "./CreateEnvironmentForm";

export const Page: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useOneTime<"GetProjects">({
    kind: "GetProjects",
    environmentDetails: false,
  });

  return (
    <PageContainer pageTitle={"Create Environment"}>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView ariaLabel="CreateEnvironment-Loading" />,
          failed: (message) => (
            <ErrorView message={message} ariaLabel="CreateEnvironment-Failed" />
          ),
          success: (projects) => (
            <CreateEnvironmentForm
              projects={projects}
              aria-label="CreateEnvironment-Success"
            />
          ),
        },
        data,
      )}
    </PageContainer>
  );
};
