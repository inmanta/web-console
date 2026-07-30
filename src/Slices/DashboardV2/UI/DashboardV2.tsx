import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { LatestCompileReportsPanel } from "./Components/CompileReports/LatestCompileReportsPanel";
import { OrchestratorDetailCard } from "./Components/Orchestrator/OrchestratorDetailCard";
import { PlaceholderSection } from "./Components/PlaceholderSection";
import { EnvironmentHealthRow } from "./EnvironmentHealthRow";

/**
 * Dashboard V2 body. Environment Health, Latest Compile Reports and the Orchestrator detail
 * card are data-wired; the remaining blocks are layout placeholders until their data wiring
 * is built.
 */
export const DashboardV2: React.FC = () => (
  <Flex direction={{ default: "column" }} gap={{ default: "gapLg" }}>
    <FlexItem>
      <EnvironmentHealthRow />
    </FlexItem>
    <FlexItem>
      <LatestCompileReportsPanel />
    </FlexItem>
    <FlexItem>
      <Flex gap={{ default: "gapLg" }}>
        <FlexItem flex={{ default: "flex_1" }}>
          <OrchestratorDetailCard />
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
