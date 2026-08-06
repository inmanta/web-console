import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@/UI/words";
import { LatestCompileReportsPanel } from "./Components/CompileReports/LatestCompileReportsPanel";
import { OrchestratorDetailCard } from "./Components/Orchestrator/OrchestratorDetailCard";
import { PlaceholderSection } from "./Components/PlaceholderSection";
import { ResourcesCard } from "./Components/Resources/ResourcesCard";
import { EnvironmentHealthRow } from "./EnvironmentHealthRow";

/**
 * Dashboard V2 body. Environment Health, Latest Compile Reports, the Orchestrator detail card
 * and the Resource Manager card are data-wired; the remaining block is a layout placeholder
 * until its data wiring is built.
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
      <Flex gap={{ default: "gapLg" }} alignItems={{ default: "alignItemsStretch" }}>
        <FlexItem flex={{ default: "flex_1" }}>
          <OrchestratorDetailCard />
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }}>
          <ResourcesCard />
        </FlexItem>
      </Flex>
    </FlexItem>
    <FlexItem>
      <PlaceholderSection title={words("dashboardV2.orchestrationEngine.title")} />
    </FlexItem>
  </Flex>
);
