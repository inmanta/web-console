import React from "react";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import styled from "styled-components";
import { BackendMetricData } from "../Core/Domain";
import { GraphCard } from "./GraphCard";
interface Props {
  title: string;
  metricType: "lsm" | "orchestrator" | "resource";
  metrics: BackendMetricData;
}

export const Section: React.FC<Props> = ({ title, metricType, metrics }) => {
  const availableKeys = Object.keys(metrics.metrics).filter((key) =>
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
        {availableKeys.map((key, index) => (
          <FlexItem
            fullWidth={{ default: "fullWidth" }}
            key={`flex-card${key}-${index}`}
          >
            <GraphCard
              isStacked={
                key.includes("resource_count") || key.includes("agent_count")
              }
              timestamps={metrics.timestamps}
              metrics={{
                name: key as string,
                data: metrics.metrics[key as string],
              }}
            />
          </FlexItem>
        ))}
      </Flex>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding-bottom: 40px;
`;
