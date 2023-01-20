import React from "react";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import styled from "styled-components";
import { mockedMetrics } from "../Core/Mock";
import { GraphCard } from "./GraphCard";
interface Props {
  title: string;
  metricType: "lsm" | "orchestrator" | "resource";
  chartType?: "line" | "stacked";
}

export const Section: React.FC<Props> = ({
  title,
  metricType,
  chartType = "line",
}) => {
  const availableKey = Object.keys(mockedMetrics.metrics).find((key) =>
    key.includes(metricType)
  );
  return (
    <Wrapper>
      <Title
        headingLevel="h2"
        style={{ paddingBottom: "20px", fontWeight: 700 }}
        size="xl"
      >
        {title}
      </Title>
      <Flex
        direction={{ default: "column" }}
        spaceItems={{ default: "spaceItemsXl" }}
      >
        <FlexItem fullWidth={{ default: "fullWidth" }}>
          <GraphCard
            isStacked={chartType === "stacked"}
            timestamps={mockedMetrics.timestamps}
            metrics={{
              name: availableKey as string,
              data: mockedMetrics.metrics[availableKey as string],
            }}
          />
        </FlexItem>
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding-bottom: 40px;
`;
