import { RouteManager } from "@/Core";
import { words } from "@/UI/words";

interface Group {
  id: string;
  title: string;
  links: Link[];
}

interface Link {
  id: string;
  label: string;
  url: string;
  external: boolean;
  locked: boolean;
  statusIndication: boolean;
}

export const envrionment = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
): Group => ({
  id: words("navigation.environment"),
  title: words("navigation.environment"),
  links: [
    {
      id: "Dashboard",
      label: routeManager.getRoute("Dashboard").generateLabel(undefined),
      url: routeManager.getRoute("Dashboard").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "Settings",
      label: routeManager.getRoute("Settings").generateLabel(undefined),
      url: routeManager.getRoute("Settings").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
  ],
});

export const lifecycleServiceManager = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
): Group => ({
  id: "LifecycleServiceManager",
  title: words("navigation.lifecycleServiceManager"),
  links: [
    {
      id: "Catalog",
      label: routeManager.getRoute("Catalog").generateLabel(undefined),
      url: routeManager.getRoute("Catalog").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
  ],
});

export const orchestrationEngine = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
): Group => ({
  id: "OrchestrationEngine",
  title: words("navigation.orchestrationEngine"),
  links: [
    {
      id: "DesiredState",
      label: routeManager.getRoute("DesiredState").generateLabel(undefined),
      url: routeManager.getRoute("DesiredState").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "CompileReports",
      label: routeManager.getRoute("CompileReports").generateLabel(undefined),
      url: routeManager.getRoute("CompileReports").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: true,
    },
    {
      id: "Parameters",
      label: routeManager.getRoute("Parameters").generateLabel(undefined),
      url: routeManager.getRoute("Parameters").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
  ],
});

export const resourceManager = (
  routeManager: RouteManager,
  isEnvPresent: boolean,
): Group => ({
  id: "ResourceManager",
  title: words("navigation.resourceManager"),
  links: [
    {
      id: "Resources",
      label: routeManager.getRoute("Resources").generateLabel(undefined),
      url: routeManager.getRoute("Resources").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "Discovered Resources",
      label: routeManager
        .getRoute("DiscoveredResources")
        .generateLabel(undefined),
      url: routeManager.getRoute("DiscoveredResources").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "Agents",
      label: routeManager.getRoute("Agents").generateLabel(undefined),
      url: routeManager.getRoute("Agents").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
    {
      id: "Facts",
      label: routeManager.getRoute("Facts").generateLabel(undefined),
      url: routeManager.getRoute("Facts").path,
      external: false,
      locked: !isEnvPresent,
      statusIndication: false,
    },
  ],
});
