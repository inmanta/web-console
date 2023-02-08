import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Text,
  Title,
} from "@patternfly/react-core";
import styled from "styled-components";
import { words } from "@/UI";
import { Metric, MetricName } from "../Core/Domain";
import { StyledDescription } from "./GraphCard";

export const NumericCard = ({ metrics }: { metrics: Metric }) => {
  const lastData = metrics.data[metrics.data.length - 1];

  return (
    <StyledCard id={`trend-card-${metrics.name}`} component="div" isRounded>
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
        <Text
          style={{
            fontWeight: 500,
            fontSize: lastData === null ? 40 : 60,
            paddingLeft: lastData === null ? 0 : 100,
          }}
        >
          {lastData == null ? "no data" : Math.round(lastData)}
        </Text>
      </CardBody>
    </StyledCard>
  );
};

export default NumericCard;

const StyledCard = styled(Card)`
  max-width: 300px;
`;
