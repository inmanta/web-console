import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Section } from "./Section";

export const Page: React.FC = () => {
  const { queryResolver, environmentHandler } = useContext(DependencyContext);

  const [envData, retry] = queryResolver.useOneTime<"GetEnvironmentDetails">({
    kind: "GetEnvironmentDetails",
    details: true,
    id: environmentHandler.useId(),
  });

  return (
    <>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="Dashboard-Loading" />,
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="Dashboard-Failed"
            />
          ),
          success: (value) => (
            <PageContainer title={words("dashboard.title")(value.name)}>
              <Section
                title={words("navigation.lifecycleServiceManager")}
                metricType="lsm"
              />
              <Section
                title={words("navigation.orchestrationEngine")}
                metricType="orchestrator"
              />
              {/* <Section title={words("navigation.resourceManager")} metricType="resource"/> */}
            </PageContainer>
          ),
        },
        envData
      )}
    </>
  );
};
