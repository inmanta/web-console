import React from "react";
import {
  Card,
  CardTitle,
  CardBody,
  CardHeader,
  Title,
  Flex,
  FlexItem,
  Content,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { GraphCardProps, Metric, MetricName } from "../Core/Domain";
import { LineChart } from "./Charts/LineChart";
import { formatLegendData, formatMetricsToStacked } from "./helper";

export const GraphCard: React.FC<GraphCardProps> = ({ isStacked, timestamps, metrics }) => {
  const [formatedMetrics, max] = formatMetricsToStacked(metrics, isStacked);

  return (
    <Card id={`trend-card-${metrics.name}`} component="div">
      <CardHeader>
        <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsNone" }}>
          <FlexItem>
            <CardTitle>
              <Title headingLevel="h3" size="lg" style={{ fontWeight: 500 }}>
                {words(`dashboard.${metrics.name as MetricName}.title`)}
              </Title>
            </CardTitle>
          </FlexItem>
          <FlexItem>
            <Content component="p">
              {words(`dashboard.${metrics.name as MetricName}.description`)}
            </Content>
          </FlexItem>
        </Flex>
      </CardHeader>
      <CardBody>
        {(formatedMetrics as Metric[]).length > 0 && (
          <LineChart
            label={words(`dashboard.${metrics.name as MetricName}.label.x`)}
            title={words(`dashboard.${metrics.name as MetricName}.title`)}
            description={words(`dashboard.${metrics.name as MetricName}.description`)}
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
