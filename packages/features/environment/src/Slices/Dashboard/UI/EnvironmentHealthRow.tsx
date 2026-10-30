import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { Content, Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { DependencyContext, useUrlIfRegistered } from "@inmanta/web-console-core/Dependency";
import { EnvSelectorOpenContext } from "@inmanta/web-console-core/Dependency/EnvSelectorOpenContext";
import { PageSize } from "@inmanta/web-console-core/Domain";
import { AgentStatus } from "@inmanta/web-console-core/Domain/Agent";
import { useGetAgents } from "@inmanta/web-console-core/Queries/Slices/Agents";
import { useGetEnvironments } from "@inmanta/web-console-core/Queries/Slices/Environment";
import { useGetProjects } from "@inmanta/web-console-core/Queries/Slices/Project";
import { useGetResources } from "@inmanta/web-console-core/Queries/Slices/Resource";
import { useGetServerStatus } from "@inmanta/web-console-core/Queries/Slices/Server";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import { EnvironmentIcon } from "@inmanta/web-console-ui/Components/EnvironmentIcon";
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
export const MINIMAL_PAGE = {
  pageSize: PageSize.minimal,
  currentPage: { kind: "CurrentPage" as const, value: "" },
};

/**
 * Environment Health row: orchestrator identity/checklist + 4 health columns, each backed by
 * the same hooks already used elsewhere in the app. Card clicks navigate to the relevant
 * existing page.
 */
export const EnvironmentHealthRow: React.FC = () => {
  const { environmentHandler } = useContext(DependencyContext);
  const { setIsOpen: setEnvSelectorOpen } = useContext(EnvSelectorOpenContext);
  const navigate = useNavigate();

  const envName = environmentHandler.useName();
  const selectedEnvironmentId = environmentHandler.useId();

  // Each column opens a page of another feature; without that feature it isn't clickable.
  const catalogUrl = useUrlIfRegistered("Catalog", undefined);
  const resourcesUrl = useUrlIfRegistered("Resources", undefined);
  const compileReportsUrl = useUrlIfRegistered("CompileReports", undefined);
  const agentsUrl = useUrlIfRegistered("Agents", undefined);

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
      <FlexItem>
        <Content component="small">{words("dashboard.environmentHealth.subtitle")}</Content>
      </FlexItem>
      <HealthCardGrid
        orchestrator={
          <OrchestratorCard
            icon={<EnvironmentIcon icon={envIcon} />}
            name={envName}
            badge={badge}
            operational={orchestratorHealth?.operational ?? false}
            checklist={
              orchestratorHealth?.checklist ?? [
                { label: words("dashboard.environmentHealth.checklist.serverOk"), ok: false },
                {
                  label: words("dashboard.environmentHealth.checklist.databaseConnected"),
                  ok: false,
                },
                {
                  label: words("dashboard.environmentHealth.checklist.schedulerRunning"),
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
            title={words("dashboard.environmentHealth.services")}
            status={servicesHealth?.status ?? "healthy"}
            statLines={servicesHealth?.statLines ?? ["—"]}
            onClick={catalogUrl ? () => navigate(catalogUrl) : undefined}
          />,
          <HealthColumn
            key="resources"
            title={words("resources")}
            status={resourcesHealth?.status ?? "healthy"}
            statLines={resourcesHealth?.statLines ?? ["—"]}
            onClick={resourcesUrl ? () => navigate(resourcesUrl) : undefined}
          />,
          <HealthColumn
            key="compiles"
            title={words("dashboard.environmentHealth.compiles")}
            status={compilesHealth.status}
            statLines={compilesHealth.statLines}
            onClick={compileReportsUrl ? () => navigate(compileReportsUrl) : undefined}
          />,
          <HealthColumn
            key="agents"
            title={words("dashboard.environmentHealth.agents")}
            status={agentsHealth?.status ?? "healthy"}
            statLines={agentsHealth?.statLines ?? ["—"]}
            onClick={agentsUrl ? () => navigate(agentsUrl) : undefined}
          />,
        ]}
      />
    </Flex>
  );
};
