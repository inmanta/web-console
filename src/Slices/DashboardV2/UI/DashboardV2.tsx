import React from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { LatestCompileReportsPanel } from "./Components/CompileReports/LatestCompileReportsPanel";
import { OrchestrationEngineCard } from "./Components/OrchestrationEngine/OrchestrationEngineCard";
import { OrchestratorDetailCard } from "./Components/Orchestrator/OrchestratorDetailCard";
import { ResourcesCard } from "./Components/Resources/ResourcesCard";
import { EnvironmentHealthRow } from "./EnvironmentHealthRow";

/**
 * A single-column CSS Grid, not PatternFly's `<Flex direction="column">` - Chromium miscomputes
 * the auto (flex-basis) height of a column-flex item whose own content is itself a row-direction
 * `Flex` (e.g. the Orchestrator/Resources row below), inflating that item's box well past its
 * actual content height. Grid's row-sizing algorithm doesn't share that bug, and `gap` behaves
 * identically for both, so this is a drop-in swap.
 */
const Stack = styled.div`
  display: grid;
  gap: var(--pf-t--global--spacer--lg);
`;

/**
 * Dashboard V2 body. Environment Health, Latest Compile Reports, the Orchestrator detail card,
 * the Resource Manager card and the Orchestration Engine trend card are all data-wired. The
 * range picker and refresh control live inside OrchestrationEngineCard itself (rendered above its
 * Card, not inside it) since it's the only card with the concept of a time range and it owns the
 * date-range state that control drives.
 */
export const DashboardV2: React.FC = () => (
  <Stack>
    <div>
      <EnvironmentHealthRow />
    </div>
    <div>
      <LatestCompileReportsPanel />
    </div>
    <div>
      <Flex gap={{ default: "gapLg" }} alignItems={{ default: "alignItemsStretch" }}>
        <FlexItem flex={{ default: "flex_1" }}>
          <OrchestratorDetailCard />
        </FlexItem>
        <FlexItem flex={{ default: "flex_1" }}>
          <ResourcesCard />
        </FlexItem>
      </Flex>
    </div>
    <div>
      <OrchestrationEngineCard />
    </div>
  </Stack>
);
