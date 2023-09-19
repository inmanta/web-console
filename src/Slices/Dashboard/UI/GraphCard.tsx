import React from "react";
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
import { GraphCardProps, Metric, MetricName } from "../Core/Domain";
import { LineChart } from "./Charts/LineChart";
import { formatLegendData, formatMetricsToStacked } from "./helper";

export const GraphCard: React.FC<GraphCardProps> = ({
  isStacked,
  timestamps,
  metrics,
}) => {
  const [formatedMetrics, max] = formatMetricsToStacked(metrics, isStacked);
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
        {(formatedMetrics as Metric[]).length > 0 && (
          <LineChart
            label={words(`dashboard.${metrics.name as MetricName}.label.x`)}
            title={words(`dashboard.${metrics.name as MetricName}.title`)}
            description={words(
              `dashboard.${metrics.name as MetricName}.description`,
            )}
            isStacked={isStacked}
            legendData={formatLegendData(metrics, isStacked)}
            timestamps={timestamps}
            metrics={formatedMetrics as Metric[]}
            max={max as number}
          />
        )}
      </CardBody>
    </Card>
  );
};
export const StyledDescription = styled.span`
  color: var(--pf-v5-global--Color--200);
`;
