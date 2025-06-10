import React, { useContext, useState } from "react";
import { Button, Flex } from "@patternfly/react-core";
import moment from "moment";
import styled from "styled-components";
import { useGetMetrics } from "@/Data/Queries";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { Section } from "./Section";

/**
 * Dashboard component that displays metrics data in sections
 *
 * Fetches metrics for a date range (default last 7 days) and displays them in sections.
 * Includes a refresh button to update the data to the latest 7 day period.
 * Conditionally renders LSM (Lifecycle Service Manager) metrics if the feature is enabled.
 * Shows loading and error states appropriately.
 *
 * @returns React component that renders the metrics dashboard
 */

export const Dashboard: React.FC = () => {
  const { orchestratorProvider } = useContext(DependencyContext);
  const [startDate, setStartDate] = useState(moment().add(-7, "days").toISOString());
  const [endDate, setEndDate] = useState(moment().toISOString());
  const {
    data: metrics,
    error,
    isError,
    isSuccess,
    refetch,
  } = useGetMetrics().useOneTime({
    startDate,
    endDate,
    isLsmAvailable: orchestratorProvider.isLsmEnabled(),
  });

  const updateCharts = () => {
    setStartDate(moment().add(-7, "days").toISOString());
    setEndDate(moment().toISOString());
  };

  if (isError) {
    return <ErrorView message={error.message} retry={refetch} ariaLabel="Metrics-Failed" />;
  }

  if (isSuccess) {
    return (
      <Wrapper aria-label="Metrics-Success">
        <RefreshWrapper>
          <Button variant="secondary" onClick={updateCharts}>
            {words("dashboard.refresh")}
          </Button>
        </RefreshWrapper>
        <Flex direction={{ default: "column" }} gap={{ default: "gapLg" }}>
          {orchestratorProvider.isLsmEnabled() && (
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
        </Flex>
      </Wrapper>
    );
  }

  return <LoadingView ariaLabel="Metrics-Loading" />;
};

const Wrapper = styled.div`
  position: relative;
`;
const RefreshWrapper = styled.div`
  position: absolute;
  right: 0;
`;
