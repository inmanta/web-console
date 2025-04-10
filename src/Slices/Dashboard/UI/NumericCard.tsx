import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Flex,
  FlexItem,
  Content,
  Title,
  Gallery,
  GalleryItem,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { Metric, MetricName } from "../Core/Domain";

export const NumericCard = ({ metrics }: { metrics: Metric }) => {
  const lastData = metrics.data[metrics.data.length - 1];

  return (
    <Gallery hasGutter maxWidths={{ default: "300px" }}>
      <GalleryItem>
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
            <Content
              component="p"
              style={{
                fontWeight: 500,
                fontSize: lastData === null ? 40 : 60,
                paddingLeft: lastData === null ? 0 : 100,
              }}
            >
              {lastData == null ? "no data" : Math.round(lastData)}
            </Content>
          </CardBody>
        </Card>
      </GalleryItem>
    </Gallery>
  );
};
