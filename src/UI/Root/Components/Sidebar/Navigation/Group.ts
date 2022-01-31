import { RouteDictionary } from "@/Core";
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
}

export const lifecycleServiceManager = (
  Route: RouteDictionary,
  isEnvPresent: boolean
): Group => ({
  id: "LifecycleServiceManager",
  title: words("navigation.lifecycleServiceManager"),
  links: [
    {
      id: Route.Catalog.kind,
      label: Route.Catalog.label,
      url: Route.Catalog.path,
      external: false,
      locked: !isEnvPresent,
    },
  ],
});

export const orchestrationEngine = (
  Route: RouteDictionary,
  isEnvPresent: boolean
): Group => ({
  id: "OrchestrationEngine",
  title: words("navigation.orchestrationEngine"),
  links: [
    {
      id: Route.DesiredState.kind,
      label: Route.DesiredState.label,
      url: Route.DesiredState.path,
      external: false,
      locked: !isEnvPresent,
    },
    {
      id: Route.CompileReports.kind,
      label: Route.CompileReports.label,
      url: Route.CompileReports.path,
      external: false,
      locked: !isEnvPresent,
    },
    {
      id: Route.Parameters.kind,
      label: Route.Parameters.label,
      url: Route.Parameters.path,
      external: false,
      locked: !isEnvPresent,
    },
  ],
});

export const resourceManager = (
  Route: RouteDictionary,
  isEnvPresent: boolean
): Group => ({
  id: "ResourceManager",
  title: words("navigation.resourceManager"),
  links: [
    {
      id: Route.Resources.kind,
      label: Route.Resources.label,
      url: Route.Resources.path,
      external: false,
      locked: !isEnvPresent,
    },
    {
      id: Route.Agents.kind,
      label: Route.Agents.label,
      url: Route.Agents.path,
      external: false,
      locked: !isEnvPresent,
    },
  ],
});

export const otherSites = (
  dashboardUrl: string,
  isEnvPresent: boolean
): Group => ({
  id: "OtherSites",
  title: "Other Sites",
  links: [
    {
      id: "Dashboard",
      label: "Dashboard",
      url: dashboardUrl,
      external: true,
      locked: !isEnvPresent,
    },
  ],
});
