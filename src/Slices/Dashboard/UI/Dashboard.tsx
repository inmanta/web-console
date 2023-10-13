import React, { useContext, useState } from "react";
import { Button } from "@patternfly/react-core";
import moment from "moment";
import styled from "styled-components";
import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Section } from "./Section";

export const Dashboard: React.FC = () => {
  const { queryResolver, featureManager } = useContext(DependencyContext);
  const [startDate, setStartDate] = useState(
    moment().add(-7, "days").toISOString(),
  );
  const [endDate, setEndDate] = useState(moment().toISOString());
  const [data, retry] = queryResolver.useOneTime<"GetMetrics">({
    kind: "GetMetrics",
    startDate,
    endDate,
    isLsmAvailable: featureManager.isLsmEnabled(),
  });

  const updateCharts = () => {
    setStartDate(moment().add(-7, "days").toISOString());
    setEndDate(moment().toISOString());
  };

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
            <Wrapper aria-label="Metrics-Success">
              <RefreshWrapper>
                <Button variant="secondary" onClick={updateCharts}>
                  {words("dashboard.refresh")}
                </Button>
              </RefreshWrapper>
              {featureManager.isLsmEnabled() && (
                <Section
                  title={words("navigation.lifecycleServiceManager")}
                  metricType="lsm"
                  metrics={metrics}
                />
              )}
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
            </Wrapper>
          ),
        },
        data,
      )}
    </>
  );
};
const Wrapper = styled.div`
  position: relative;
`;
const RefreshWrapper = styled.div`
  position: absolute;
  right: 0;
`;
