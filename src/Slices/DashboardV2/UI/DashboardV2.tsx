import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { PlaceholderSection } from "./Components/PlaceholderSection";
import { EnvironmentHealthRow } from "./EnvironmentHealthRow";

/**
 * Dashboard V2 body. Only the Environment Health row (block 1) is data-wired so far;
 * the remaining blocks are layout placeholders filled in during Phases 5-8
 * (see documentation/7136-plan.md).
 */
export const DashboardV2: React.FC = () => (
  <Flex direction={{ default: "column" }} gap={{ default: "gapLg" }}>
    <FlexItem>
      <EnvironmentHealthRow />
    </FlexItem>
    <FlexItem>
      <PlaceholderSection title={words("dashboardV2.compileReports.title")} />
    </FlexItem>
    <FlexItem>
      <Flex gap={{ default: "gapLg" }}>
        <FlexItem flex={{ default: "flex_1" }}>
          <PlaceholderSection title={words("dashboardV2.orchestrator.title")} />
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }}>
          <PlaceholderSection title={words("dashboardV2.resourceManager.title")} />
        </FlexItem>
      </Flex>
    </FlexItem>
    <FlexItem>
      <PlaceholderSection title={words("dashboardV2.orchestrationEngine.title")} />
    </FlexItem>
  </Flex>
);
