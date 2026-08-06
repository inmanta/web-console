import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { Button, Content, Flex, FlexItem } from "@patternfly/react-core";
import { OutlinedCalendarAltIcon } from "@patternfly/react-icons";
import { PageSize } from "@/Core/Domain";
import {
  useGetAgents,
  useGetEnvironments,
  useGetProjects,
  useGetResources,
  useGetServerStatus,
  useGetServiceModels,
} from "@/Data/Queries";
import { AgentStatus } from "@/Slices/Agents/Core/Domain";
import { DependencyContext } from "@/UI/Dependency";
import { EnvironmentIcon } from "@/UI/Root/Components/Header/EnvSelector/EnvSelector";
import { EnvSelectorOpenContext } from "@/UI/Root/Components/Header/EnvSelector/EnvSelectorOpenContext";
import { words } from "@/UI/words";
import { HealthCardGrid } from "./Components/EnvironmentHealth/HealthCardGrid";
import { HealthColumn } from "./Components/EnvironmentHealth/HealthColumn";
import { OrchestratorCard } from "./Components/EnvironmentHealth/OrchestratorCard";
import { deriveAgentsHealth } from "./agentsHealth";
import { deriveCompilesHealth } from "./compilesHealth";
import { deriveOrchestratorHealth } from "./orchestratorHealth";
import { deriveResourcesHealth } from "./resourcesHealth";
import { aggregateServicesHealth } from "./servicesHealth";
import { useLatestCompileReports } from "./useLatestCompileReports";

// Used for calls that only read metadata.total / a GraphQL summary field / the first row, never
// the actual page of results — PageSize.minimal ("1") keeps this scoped to these specific calls
// without touching PageSize.initial ("20"), which the rest of the app's paginated tables rely on
// as their lower bound.
const MINIMAL_PAGE = {
  pageSize: PageSize.minimal,
  currentPage: { kind: "CurrentPage" as const, value: "" },
};

/**
 * Environment Health row: orchestrator identity/checklist + 4 health columns, each backed by
 * the same hooks already used elsewhere in the app. Card clicks navigate to the relevant
 * existing page.
 */
export const EnvironmentHealthRow: React.FC = () => {
  const { routeManager, environmentHandler } = useContext(DependencyContext);
  const { setIsOpen: setEnvSelectorOpen } = useContext(EnvSelectorOpenContext);
  const navigate = useNavigate();

  const envName = environmentHandler.useName();
  const selectedEnvironmentId = environmentHandler.useId();

  const catalogUrl = routeManager.useUrl("Catalog", undefined);
  const resourcesUrl = routeManager.useUrl("Resources", undefined);
  const compileReportsUrl = routeManager.useUrl("CompileReports", undefined);
  const agentsUrl = routeManager.useUrl("Agents", undefined);

  const { data: serverStatus } = useGetServerStatus().useContinuous();
  const { data: serviceModels } = useGetServiceModels().useContinuous();
  const { data: resourcesData } = useGetResources({
    ...MINIMAL_PAGE,
    filter: {},
    sort: [],
  }).useContinuous();
  const { data: latestCompileReports } = useLatestCompileReports();
  const { data: totalAgents } = useGetAgents().useContinuous(MINIMAL_PAGE);
  const { data: downAgents } = useGetAgents().useContinuous({
    ...MINIMAL_PAGE,
    filter: { status: [AgentStatus.down] },
  });
  const { data: pausedAgents } = useGetAgents().useContinuous({
    ...MINIMAL_PAGE,
    filter: { status: [AgentStatus.paused] },
  });
  const { data: environments } = useGetEnvironments().useOneTime(true);
  const { data: projects } = useGetProjects().useOneTime();

  const projectNameById = new Map((projects ?? []).map((project) => [project.id, project.name]));
  const currentEnvironment = environments?.find((env) => env.id === selectedEnvironmentId);
  const badge = currentEnvironment ? projectNameById.get(currentEnvironment.project_id) : undefined;
  // The API returns the icon as a bare data URI body (e.g. "image/svg+xml;base64,..."), same as
  // the header's own environment selector (EnvSelectorWithData.environmentToSelector).
  const envIcon = currentEnvironment?.icon ? `data:${currentEnvironment.icon}` : undefined;

  const orchestratorHealth = serverStatus ? deriveOrchestratorHealth(serverStatus) : undefined;
  const servicesHealth = serviceModels ? aggregateServicesHealth(serviceModels) : undefined;
  const resourcesHealth = resourcesData
    ? deriveResourcesHealth(resourcesData.resourceSummary)
    : undefined;
  const compilesHealth = deriveCompilesHealth(latestCompileReports?.data[0]);
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
          <Content component="small">{words("dashboardV2.environmentHealth.subtitle")}</Content>
        </FlexItem>
        <Flex alignItems={{ default: "alignItemsCenter" }} spaceItems={{ default: "spaceItemsMd" }}>
          <FlexItem>
            <Button variant="secondary" icon={<OutlinedCalendarAltIcon />}>
              {words("dashboardV2.environmentHealth.rangeLast7Days")}
            </Button>
          </FlexItem>
        </Flex>
      </Flex>
      <HealthCardGrid
        orchestrator={
          <OrchestratorCard
            icon={<EnvironmentIcon icon={envIcon} />}
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
            onSwitchClick={() => setEnvSelectorOpen(true)}
          />
        }
        columns={[
          <HealthColumn
            key="services"
            title={words("dashboardV2.environmentHealth.services")}
            status={servicesHealth?.status ?? "healthy"}
            statLines={servicesHealth?.statLines ?? ["—"]}
            onClick={() => navigate(catalogUrl)}
          />,
          <HealthColumn
            key="resources"
            title={words("dashboardV2.environmentHealth.resources")}
            status={resourcesHealth?.status ?? "healthy"}
            statLines={resourcesHealth?.statLines ?? ["—"]}
            onClick={() => navigate(resourcesUrl)}
          />,
          <HealthColumn
            key="compiles"
            title={words("dashboardV2.environmentHealth.compiles")}
            status={compilesHealth.status}
            statLines={compilesHealth.statLines}
            onClick={() => navigate(compileReportsUrl)}
          />,
          <HealthColumn
            key="agents"
            title={words("dashboardV2.environmentHealth.agents")}
            status={agentsHealth?.status ?? "healthy"}
            statLines={agentsHealth?.statLines ?? ["—"]}
            onClick={() => navigate(agentsUrl)}
          />,
        ]}
      />
    </Flex>
  );
};
