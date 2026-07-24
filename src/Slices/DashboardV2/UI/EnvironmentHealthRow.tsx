import React from "react";
import { Button, Content, Flex, FlexItem } from "@patternfly/react-core";
import { OutlinedCalendarAltIcon, RedoIcon } from "@patternfly/react-icons";
import { words } from "@/UI/words";
import { HealthCardGrid } from "./Components/HealthCardGrid";
import { HealthColumn } from "./Components/HealthColumn";
import { OrchestratorCard } from "./Components/OrchestratorCard";

/**
 * Environment Health row. All values below are static scaffolding (Phase 1) matching the
 * design reference — Phases 2-4 replace them with data sourced from the existing
 * useGetServerStatus/useGetServiceModels/useGetResources/useGetCompileReports/useGetAgents hooks.
 */
export const EnvironmentHealthRow: React.FC = () => (
  <Flex direction={{ default: "column" }} spaceItems={{ default: "spaceItemsMd" }}>
    <Flex
      justifyContent={{ default: "justifyContentSpaceBetween" }}
      alignItems={{ default: "alignItemsFlexStart" }}
    >
      <FlexItem>
        <Content component="h2">{words("dashboardV2.environmentHealth.title")}</Content>
        <Content component="small">{words("dashboardV2.environmentHealth.subtitle")}</Content>
      </FlexItem>
      <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsMd" }}>
        <FlexItem>
          <Content component="small">{words("dashboardV2.environmentHealth.updated")("2")}</Content>
        </FlexItem>
        <FlexItem>
          <Button variant="secondary" icon={<OutlinedCalendarAltIcon />}>
            {words("dashboardV2.environmentHealth.rangeLast7Days")}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant="primary" icon={<RedoIcon />}>
            {words("dashboard.refresh")}
          </Button>
        </FlexItem>
      </Flex>
    </Flex>
    <HealthCardGrid
      orchestrator={
        <OrchestratorCard
          icon={<EnvironmentIconPlaceholder />}
          name="prod"
          badge="infra"
          operational
          checklist={[
            { label: words("dashboardV2.environmentHealth.checklist.serverOk"), ok: true },
            {
              label: words("dashboardV2.environmentHealth.checklist.databaseConnected"),
              ok: true,
            },
            {
              label: words("dashboardV2.environmentHealth.checklist.schedulerRunning"),
              ok: true,
            },
          ]}
        />
      }
      columns={[
        <HealthColumn
          key="services"
          title={words("dashboardV2.environmentHealth.services")}
          status="attention"
          statLines={["68 instances · 62 healthy · 4 warning · 2 danger"]}
        />,
        <HealthColumn
          key="resources"
          title={words("dashboardV2.environmentHealth.resources")}
          status="attention"
          statLines={["18 failed to deploy"]}
        />,
        <HealthColumn
          key="compiles"
          title={words("dashboardV2.environmentHealth.compiles")}
          status="healthy"
          statLines={["Latest compile succeeded · 3 failed in 7d"]}
        />,
        <HealthColumn
          key="agents"
          title={words("dashboardV2.environmentHealth.agents")}
          status="attention"
          statLines={["12 agents · 11 up · 1 down · 0 paused"]}
        />,
      ]}
    />
  </Flex>
);

const EnvironmentIconPlaceholder: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <polygon points="10,2 18,18 2,18" fill="var(--pf-t--global--icon--color--brand--default)" />
  </svg>
);
