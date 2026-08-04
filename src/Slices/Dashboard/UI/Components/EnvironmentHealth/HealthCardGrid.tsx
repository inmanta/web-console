import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";

interface Props {
  orchestrator: React.ReactNode;
  columns: React.ReactNode[];
}

/**
 * Layout row for the Environment Health cards: the orchestrator card (wider) followed by N
 * equal-width column cards, each rendering as its own independent Card (see ClickableCard).
 */
export const HealthCardGrid: React.FC<Props> = ({ orchestrator, columns }) => (
  <Flex spaceItems={{ default: "spaceItemsMd" }} alignItems={{ default: "alignItemsStretch" }}>
    <FlexItem flex={{ default: "flex_2" }}>{orchestrator}</FlexItem>
    {columns.map((column, index) => (
      <FlexItem key={index} flex={{ default: "flex_1" }}>
        {column}
      </FlexItem>
    ))}
  </Flex>
);
