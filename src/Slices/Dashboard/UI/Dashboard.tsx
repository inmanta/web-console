import React, { useContext, useEffect, useState } from "react";
import moment from "moment";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Section } from "./Section";

export const Dashboard: React.FC = () => {
  const { queryResolver } = useContext(DependencyContext);
  const [startDate, setStartDate] = useState(
    moment().add(-1, "days").toISOString()
  );
  const [endDate, setEndDate] = useState(moment().toISOString());
  const [data, retry] = queryResolver.useOneTime<"GetMetrics">({
    kind: "GetMetrics",
    startDate,
    endDate,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStartDate(moment().add(-1, "days").toISOString());
      setEndDate(moment().toISOString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);
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
          success: (metrics) => (
            <div aria-label="Metrics-Success">
              <Section
                title={words("navigation.lifecycleServiceManager")}
                metricType="lsm"
                metrics={metrics}
              />
              <Section
                title={words("navigation.orchestrationEngine")}
                metricType="orchestrator"
                metrics={metrics}
              />
              <Section
                title={words("navigation.resourceManager")}
                metricType="resource"
                metrics={metrics}
              />
            </div>
          ),
        },
        data
      )}
    </>
  );
};
