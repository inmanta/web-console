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
      label: Route.Catalog.generateLabel(undefined),
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
      label: Route.DesiredState.generateLabel(undefined),
      url: Route.DesiredState.path,
      external: false,
      locked: !isEnvPresent,
    },
    {
      id: Route.CompileReports.kind,
      label: Route.CompileReports.generateLabel(undefined),
      url: Route.CompileReports.path,
      external: false,
      locked: !isEnvPresent,
    },
    {
      id: Route.Parameters.kind,
      label: Route.Parameters.generateLabel(undefined),
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
      label: Route.Resources.generateLabel(undefined),
      url: Route.Resources.path,
      external: false,
      locked: !isEnvPresent,
    },
    {
      id: Route.Agents.kind,
      label: Route.Agents.generateLabel(undefined),
      url: Route.Agents.path,
      external: false,
      locked: !isEnvPresent,
    },
    {
      id: Route.Facts.kind,
      label: Route.Facts.generateLabel(undefined),
      url: Route.Facts.path,
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
