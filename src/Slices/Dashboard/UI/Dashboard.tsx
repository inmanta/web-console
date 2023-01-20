import React, { useContext } from "react";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Section } from "./Section";

export const Dashboard: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [data, retry] = queryResolver.useContinuous<"GetMetrics">({
    kind: "GetMetrics",
  });

  return (
    <>
      {RemoteData.fold(
        {
          notAsked: () => null,
          loading: () => <LoadingView aria-label="Metrics-Loading" />,
          failed: (error) => (
            <ErrorView
              message={error}
              retry={retry}
              aria-label="Metrics-Failed"
            />
          ),
          // success: (metrics) => (
          success: () => (
            <div aria-label="Metrics-Success">
              <Section
                title={words("navigation.lifecycleServiceManager")}
                metricType="lsm"
              />
              <Section
                title={words("navigation.orchestrationEngine")}
                metricType="orchestrator"
              />
              <Section
                title={words("navigation.resourceManager")}
                metricType="resource"
                chartType="stacked"
              />
            </div>
          ),
        },
        data
      )}
    </>
  );
};
