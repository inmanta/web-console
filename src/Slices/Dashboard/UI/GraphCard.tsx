import React, { useEffect, useState } from "react";
import {
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  Title,
  Flex,
  FlexItem,
} from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI";
import {
  GraphCardProps,
  LegendData,
  Metric,
  MetricName,
  StackedMetric,
} from "../Core/interfaces";
import { LineChart } from "./Charts/LineChart";
import { colorTheme } from "./themes";

export const GraphCard: React.FC<GraphCardProps> = ({
  isStacked,
  timestamps,
  metrics,
}) => {
  const [chartState, setChartState] = useState<Metric[]>([]);
  const [legendDataState, setLegendDataState] = useState<LegendData[]>([]);
  const [minMax, setMinMax] = useState<number[]>([]);

  useEffect(() => {
    if (isStacked) {
      const tempCharState: Metric[] = [
        {
          name: "down",
          data: [],
        },
        {
          name: "paused",
          data: [],
        },
        {
          name: "up",
          data: [],
        },
      ];
      const { data } = metrics as StackedMetric;
      data.map(({ down, paused, up }) => {
        tempCharState[0].data.push(down);
        tempCharState[1].data.push(paused);
        tempCharState[2].data.push(up);
      });
      const dataValuesOnly = tempCharState.map((object) => object.data);
      const tempMinMax = dataValuesOnly[0]
        .map(
          (value, index) =>
            value + dataValuesOnly[1][index] + dataValuesOnly[2][index]
        )
        .sort((a, b) => a - b);

      setChartState(tempCharState);
      setMinMax(tempMinMax);
      setLegendDataState(
        tempCharState.map(({ name }) => {
          return {
            childName: name,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            symbol: {
              fill:
                colorTheme[name] === undefined
                  ? colorTheme.default
                  : colorTheme[name],
            },
          };
        })
      );
    } else {
      setChartState([metrics as Metric]);
      setMinMax((metrics as Metric).data.flat().sort((a, b) => a - b));
      setLegendDataState([
        {
          childName: metrics.name,
          name:
            metrics.name.split(".")[1].charAt(0).toUpperCase() +
            metrics.name.split(".")[1].slice(1),
          symbol: {
            fill:
              colorTheme[metrics.name] === undefined
                ? colorTheme.default
                : colorTheme[metrics.name],
          },
        },
      ]);
    }
  }, [metrics, isStacked]);
  return (
    <Card id={`trend-card-${metrics.name}`} component="div" isRounded>
      <CardHeader>
        <Flex
          direction={{ default: "column" }}
          spaceItems={{ default: "spaceItemsNone" }}
        >
          <FlexItem>
            <CardTitle>
              <Title headingLevel="h3" size="lg" style={{ fontWeight: 500 }}>
                {words(`dashboard.${metrics.name as MetricName}.title`)}
              </Title>
            </CardTitle>
          </FlexItem>
          <FlexItem>
            <StyledDescription>
              {words(`dashboard.${metrics.name as MetricName}.description`)}
            </StyledDescription>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        {chartState.length > 0 && (
          <LineChart
            label={words(`dashboard.${metrics.name as MetricName}.label.x`)}
            title={words(`dashboard.${metrics.name as MetricName}.title`)}
            description={words(
              `dashboard.${metrics.name as MetricName}.description`
            )}
            isStacked={isStacked}
            legendData={legendDataState}
            timestamps={timestamps}
            metrics={chartState}
            minMax={minMax}
          />
        )}
      </CardBody>
    </Card>
  );
};
const StyledDescription = styled.span`
  color: var(--pf-global--Color--200);
`;
