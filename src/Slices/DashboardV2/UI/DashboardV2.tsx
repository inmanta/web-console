import React from "react";
import { Flex, FlexItem, Grid, GridItem } from "@patternfly/react-core";
import { LatestCompileReportsPanel } from "./Components/CompileReports/LatestCompileReportsPanel";
import { OrchestrationEngineCard } from "./Components/OrchestrationEngine/OrchestrationEngineCard";
import { OrchestratorDetailCard } from "./Components/Orchestrator/OrchestratorDetailCard";
import { ResourcesCard } from "./Components/Resources/ResourcesCard";
import { EnvironmentHealthRow } from "./EnvironmentHealthRow";

/**
 * Dashboard V2 body. Environment Health, Latest Compile Reports, the Orchestrator detail card,
 * the Resource Manager card and the Orchestration Engine trend card are all data-wired. The
 * range picker and refresh control live inside OrchestrationEngineCard itself (rendered above its
 * Card, not inside it) since it's the only card with the concept of a time range and it owns the
 * date-range state that control drives.
 *
 * The outer layout is a single-column `Grid` (each `GridItem` defaults to a full-width span, so
 * this stacks like PatternFly's `<Flex direction="column">` would) rather than `Flex` - Chromium
 * miscomputes the auto (flex-basis) height of a column-flex item whose own content is itself a
 * row-direction `Flex` (the Orchestrator/Resources row below), inflating that item's box well
 * past its actual content height. Grid's row-sizing algorithm doesn't share that bug.
 */
export const DashboardV2: React.FC = () => (
  <Grid hasGutter>
    <GridItem>
      <EnvironmentHealthRow />
    </GridItem>
    <GridItem>
      <LatestCompileReportsPanel />
    </GridItem>
    <GridItem>
      <Flex gap={{ default: "gapLg" }} alignItems={{ default: "alignItemsStretch" }}>
        <FlexItem flex={{ default: "flex_1" }}>
          <OrchestratorDetailCard />
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }}>
          <ResourcesCard />
        </FlexItem>
      </Flex>
    </GridItem>
    <GridItem>
      <OrchestrationEngineCard />
    </GridItem>
  </Grid>
);
