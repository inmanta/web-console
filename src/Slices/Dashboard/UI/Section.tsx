import React from "react";
import { Flex, FlexItem, Title } from "@patternfly/react-core";
import { mockedMetrics } from "../Data/mockData";
import { LineChart } from "./LineChart";
interface Props {
  title: string;
  metricType: "lsm" | "orchestrator" | "resource";
}

export const Section: React.FC<Props> = ({ title, metricType }) => {
  const availableKeys = Object.keys(mockedMetrics.metrics).filter((key) =>
    key.includes(metricType)
  );
  return (
    <>
      <Title headingLevel="h2">{title}</Title>
      <Flex>
        <FlexItem>
          <LineChart
            metricNames={availableKeys}
            timestamps={mockedMetrics.timestamps}
            metrics={availableKeys.map((key) => {
              return {
                name: key,
                data: mockedMetrics.metrics[key] as number[],
              };
            })}
            minMax={availableKeys
              .map((key) => mockedMetrics.metrics[key])
              .flat()
              .sort((a, b) => a - b)}
          />
        </FlexItem>
      </Flex>
    </>
  );
};
