import React, { useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button, Content, Flex, FlexItem } from "@patternfly/react-core";
import { OutlinedCalendarAltIcon, RedoIcon } from "@patternfly/react-icons";
import {
  useGetAgents,
  useGetCompileReports,
  useGetEnvironments,
  useGetProjects,
  useGetResources,
  useGetServerStatus,
  useGetServiceModels,
} from "@/Data/Queries";
import { CompileStatus, PageSize, RangeOperator } from "@/Core/Domain";
import { AgentStatus } from "@/Slices/Agents/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import dayjs from "@/dayjs";
import { deriveAgentsHealth } from "./agentsHealth";
import { HealthCardGrid } from "./Components/HealthCardGrid";
import { HealthColumn } from "./Components/HealthColumn";
import { EnvironmentSwitchMenu } from "./Components/EnvironmentSwitchMenu";
import { OrchestratorCard } from "./Components/OrchestratorCard";
import { deriveCompilesHealth } from "./compilesHealth";
import { deriveOrchestratorHealth } from "./orchestratorHealth";
import { deriveResourcesHealth } from "./resourcesHealth";
import { aggregateServicesHealth } from "./servicesHealth";

const NO_PAGINATION = {
  pageSize: PageSize.initial,
  currentPage: { kind: "CurrentPage" as const, value: "" },
};

/**
 * Environment Health row: orchestrator identity/checklist + 4 health columns, each backed by
 * the same hooks already used elsewhere in the app (see documentation/7136-plan.md §2).
 * Card clicks navigate to the relevant existing page.
 */
export const EnvironmentHealthRow: React.FC = () => {
  const { routeManager, environmentHandler } = useContext(DependencyContext);
  const navigate = useNavigate();
  const location = useLocation();

  const envName = environmentHandler.useName();
  const selectedEnvironmentId = environmentHandler.useId();

  const catalogUrl = routeManager.useUrl("Catalog", undefined);
  const resourcesUrl = routeManager.useUrl("Resources", undefined);
  const compileReportsUrl = routeManager.useUrl("CompileReports", undefined);
  const agentsUrl = routeManager.useUrl("Agents", undefined);

  // Computed once per mount: recomputing this inline on every render would put a fresh
  // millisecond-precision Date into the query's filter on every render, changing its query key
  // each time and causing React Query to treat it as a brand new query — refetching immediately,
  // every render, in a tight loop instead of respecting the poll interval.
  const sevenDaysAgo = useMemo(() => dayjs().subtract(7, "days").toDate(), []);

  const { data: serverStatus } = useGetServerStatus().useContinuous();
  const { data: serviceModels } = useGetServiceModels().useContinuous();
  const { data: resourcesData } = useGetResources({
    ...NO_PAGINATION,
    filter: {},
    sort: [],
  }).useContinuous();
  const { data: latestCompileReports } = useGetCompileReports({
    ...NO_PAGINATION,
    sort: { name: "requested", order: "desc" },
  }).useContinuous();
  const { data: failedCompileReports } = useGetCompileReports({
    ...NO_PAGINATION,
    filter: {
      status: CompileStatus.failed,
      requested: [{ date: sevenDaysAgo, operator: RangeOperator.Operator.From }],
    },
  }).useContinuous();
  const { data: totalAgents } = useGetAgents().useContinuous(NO_PAGINATION);
  const { data: downAgents } = useGetAgents().useContinuous({
    ...NO_PAGINATION,
    filter: { status: [AgentStatus.down] },
  });
  const { data: pausedAgents } = useGetAgents().useContinuous({
    ...NO_PAGINATION,
    filter: { status: [AgentStatus.paused] },
  });
  const { data: environments } = useGetEnvironments().useOneTime(true);
  const { data: projects } = useGetProjects().useOneTime();

  const projectNameById = new Map((projects ?? []).map((project) => [project.id, project.name]));
  const currentEnvironment = environments?.find((env) => env.id === selectedEnvironmentId);
  const badge = currentEnvironment
    ? projectNameById.get(currentEnvironment.project_id)
    : undefined;
  const switchOptions = (environments ?? []).map((env) => ({
    id: env.id,
    name: env.name,
    projectName:
      projectNameById.get(env.project_id) ?? words("dashboardV2.environmentHealth.unknownProject"),
  }));

  const orchestratorHealth = serverStatus ? deriveOrchestratorHealth(serverStatus) : undefined;
  const servicesHealth = serviceModels ? aggregateServicesHealth(serviceModels) : undefined;
  const resourcesHealth = resourcesData
    ? deriveResourcesHealth(resourcesData.resourceSummary)
    : undefined;
  const compilesHealth = deriveCompilesHealth(
    latestCompileReports?.data[0],
    Number(failedCompileReports?.metadata.total ?? 0)
  );
  const agentsHealth =
    totalAgents && downAgents && pausedAgents
      ? deriveAgentsHealth(
          Number(totalAgents.metadata.total),
          Number(downAgents.metadata.total),
          Number(pausedAgents.metadata.total)
        )
      : undefined;

  return (
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
            <Content component="small">
              {words("dashboardV2.environmentHealth.updated")("2")}
            </Content>
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
            name={envName}
            badge={badge}
            operational={orchestratorHealth?.operational ?? false}
            checklist={
              orchestratorHealth?.checklist ?? [
                { label: words("dashboardV2.environmentHealth.checklist.serverOk"), ok: false },
                {
                  label: words("dashboardV2.environmentHealth.checklist.databaseConnected"),
                  ok: false,
                },
                {
                  label: words("dashboardV2.environmentHealth.checklist.schedulerRunning"),
                  ok: false,
                },
              ]
            }
            switchAction={
              <EnvironmentSwitchMenu
                options={switchOptions}
                onSelect={(environmentId) => environmentHandler.set(navigate, location, environmentId)}
              />
            }
          />
        }
        columns={[
          <HealthColumn
            key="services"
            title={words("dashboardV2.environmentHealth.services")}
            status={servicesHealth?.status ?? "healthy"}
            statLines={[servicesHealth?.statLine ?? "—"]}
            onClick={() => navigate(catalogUrl)}
          />,
          <HealthColumn
            key="resources"
            title={words("dashboardV2.environmentHealth.resources")}
            status={resourcesHealth?.status ?? "healthy"}
            statLines={[resourcesHealth?.statLine ?? "—"]}
            onClick={() => navigate(resourcesUrl)}
          />,
          <HealthColumn
            key="compiles"
            title={words("dashboardV2.environmentHealth.compiles")}
            status={compilesHealth.status}
            statLines={[compilesHealth.statLine]}
            onClick={() => navigate(compileReportsUrl)}
          />,
          <HealthColumn
            key="agents"
            title={words("dashboardV2.environmentHealth.agents")}
            status={agentsHealth?.status ?? "healthy"}
            statLines={[agentsHealth?.statLine ?? "—"]}
            onClick={() => navigate(agentsUrl)}
          />,
        ]}
      />
    </Flex>
  );
};

const EnvironmentIconPlaceholder: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <polygon points="10,2 18,18 2,18" fill="var(--pf-t--global--icon--color--brand--default)" />
  </svg>
);
