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
} from "../Core/Domain";
import { LineChart } from "./Charts/LineChart";
import { colorTheme } from "./themes";

export const GraphCard: React.FC<GraphCardProps> = ({
  isStacked,
  timestamps,
  metrics,
}) => {
  const [chartState, setChartState] = useState<Metric[]>([]);
  const [legendDataState, setLegendDataState] = useState<LegendData[]>([]);
  const [max, setMax] = useState<number>(0);

  useEffect(() => {
    if (isStacked) {
      const tempCharState: Metric[] = [];
      let max = 0;
      const { data } = metrics as StackedMetric;
      const base = data.find((object) => object !== null);
      if (base !== undefined && base !== null) {
        const keys = Object.keys(base);
        keys.map((key) => {
          tempCharState.push({
            name: key,
            data: [],
          });
        });
        data.map((object) => {
          let tempMax = 0;
          keys.forEach((key, index) => {
            tempMax += object === null ? 0 : object[key];
            tempCharState[index].data.push(
              object === null ? null : object[key]
            );
          });
          if (max < tempMax) {
            max = tempMax;
          }
        });
      }

      setChartState(tempCharState);
      setMax(max);
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
      setMax(
        (metrics as Metric).data
          .flat()
          .map((value) => (value !== null ? value : 0))
          .sort((a, b) => a - b)[(metrics as Metric).data.flat().length - 1]
      );
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
            max={max}
          />
        )}
      </CardBody>
    </Card>
  );
};
const StyledDescription = styled.span`
  color: var(--pf-global--Color--200);
`;
