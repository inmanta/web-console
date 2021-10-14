import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Nav, NavItem, NavGroup } from "@patternfly/react-core";
import { Route, SearchHelper } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DependencyContext } from "@/UI/Dependency";

interface Group {
  id: string;
  title: string;
  links: Link[];
}

export const Navigation: React.FC<{ environment: string }> = ({
  environment,
}) => {
  const { featureManager } = useContext(DependencyContext);
  const groups: Group[] = [
    ...(featureManager.isLsmEnabled() ? [lifecycleServiceManager] : []),
    orchestrationEngine,
    resourceManager,
    otherSites(environment),
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
  <NavItem key={id}>
    {external ? (
      <a className="pf-c-nav__link" href={url} target="_blank" rel="noreferrer">
        {label}
      </a>
    ) : (
      <NavLink
        exact={true}
        to={{
          pathname: url,
          search: new SearchHelper().keepEnvOnly(location.search),
        }}
        activeClassName="pf-m-current"
      >
        {label}
      </NavLink>
    )}
  </NavItem>
);

const lifecycleServiceManager: Group = {
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
};

const orchestrationEngine: Group = {
  id: "OrchestrationEngine",
  title: words("navigation.orchestrationEngine"),
  links: [
    {
      id: Route.CompileReports.kind,
      label: Route.CompileReports.label,
      url: Route.CompileReports.path,
      external: false,
    },
  ],
};

const resourceManager: Group = {
  id: "ResourceManager",
  title: words("navigation.resourceManager"),
  links: [
    {
      id: Route.Resources.kind,
      label: Route.Resources.label,
      url: Route.Resources.path,
      external: false,
    },
  ],
};

const otherSites = (env: string): Group => ({
  id: "OtherSites",
  title: "Other Sites",
  links: [
    {
      id: "Dashboard",
      label: "Dashboard",
      url: Route.DashboardUrl(env),
      external: true,
    },
  ],
});
