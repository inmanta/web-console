import React from "react";
import { Card, CardBody, Divider, Flex, FlexItem } from "@patternfly/react-core";

interface Props {
  orchestrator: React.ReactNode;
  columns: React.ReactNode[];
}

/**
 * Layout container for the Environment Health row: the orchestrator card on the left, followed
 * by N equal-width columns, each separated by a vertical divider.
 */
export const HealthCardGrid: React.FC<Props> = ({ orchestrator, columns }) => (
  <Card>
    <CardBody>
      <Flex
        spaceItems={{ default: "spaceItemsNone" }}
        alignItems={{ default: "alignItemsStretch" }}
      >
        <FlexItem flex={{ default: "flex_1" }}>{orchestrator}</FlexItem>
        <Divider orientation={{ default: "vertical" }} />
        {columns.map((column, index) => (
          <React.Fragment key={index}>
            <FlexItem flex={{ default: "flex_1" }}>{column}</FlexItem>
            {index < columns.length - 1 && <Divider orientation={{ default: "vertical" }} />}
          </React.Fragment>
        ))}
      </Flex>
    </CardBody>
  </Card>
);
