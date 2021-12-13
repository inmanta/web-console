import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Nav, NavItem, NavGroup } from "@patternfly/react-core";
import { RouteDictionary } from "@/Core";
import { DependencyContext } from "@/UI/Dependency";
import { SearchHelper } from "@/UI/Routing";
import { words } from "@/UI/words";

interface Group {
  id: string;
  title: string;
  links: Link[];
}

export const Navigation: React.FC<{ environment: string }> = ({
  environment,
}) => {
  const { featureManager, routeManager, urlManager } =
    useContext(DependencyContext);
  const routeDict = routeManager.getRouteDictionary();
  const groups: Group[] = [
    ...(featureManager.isLsmEnabled()
      ? [lifecycleServiceManager(routeDict)]
      : []),
    orchestrationEngine(routeDict),
    resourceManager(routeDict),
    otherSites(urlManager.getDashboardUrl(environment)),
  ];
  return (
    <Nav theme="dark">
      {groups.map(({ id, title, links }) => (
        <NavGroup title={title} key={id}>
          {links.map(Item)}
        </NavGroup>
      ))}
    </Nav>
  );
};

interface Link {
  id: string;
  label: string;
  url: string;
  external: boolean;
}

const Item: React.FC<Link> = ({ id, label, url, external }) => (
  <NavItem key={id} styleChildren={false}>
    {external ? (
      <a className="pf-c-nav__link" href={url} target="_blank" rel="noreferrer">
        {label}
      </a>
    ) : (
      <NavLink
        to={{
          pathname: url,
          search: new SearchHelper().keepEnvOnly(location.search),
        }}
        className={({ isActive }) =>
          "pf-c-nav__link" + (isActive ? " pf-m-current" : "")
        }
        end
      >
        {label}
      </NavLink>
    )}
  </NavItem>
);

const lifecycleServiceManager = (Route: RouteDictionary): Group => ({
  id: "LifecycleServiceManager",
  title: words("navigation.lifecycleServiceManager"),
  links: [
    {
      id: Route.Catalog.kind,
      label: Route.Catalog.label,
      url: Route.Catalog.path,
      external: false,
    },
  ],
});

const orchestrationEngine = (Route: RouteDictionary): Group => ({
  id: "OrchestrationEngine",
  title: words("navigation.orchestrationEngine"),
  links: [
    {
      id: Route.DesiredState.kind,
      label: Route.DesiredState.label,
      url: Route.DesiredState.path,
      external: false,
    },
    {
      id: Route.CompileReports.kind,
      label: Route.CompileReports.label,
      url: Route.CompileReports.path,
      external: false,
    },
  ],
});

const resourceManager = (Route: RouteDictionary): Group => ({
  id: "ResourceManager",
  title: words("navigation.resourceManager"),
  links: [
    {
      id: Route.Resources.kind,
      label: Route.Resources.label,
      url: Route.Resources.path,
      external: false,
    },
    {
      id: Route.Agents.kind,
      label: Route.Agents.label,
      url: Route.Agents.path,
      external: false,
    },
  ],
});

const otherSites = (dashboardUrl: string): Group => ({
  id: "OtherSites",
  title: "Other Sites",
  links: [
    {
      id: "Dashboard",
      label: "Dashboard",
      url: dashboardUrl,
      external: true,
    },
  ],
});
