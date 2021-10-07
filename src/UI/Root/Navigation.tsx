import React from "react";
import { NavLink } from "react-router-dom";
import { Nav, NavItem, NavGroup } from "@patternfly/react-core";
import { Route, SearchHelper } from "@/UI/Routing";
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
}

/**
 * @NOTE This component still contains a hardcoded url to the dashboard.
 * We will not move this url to a better solution because it will be
 * removed in the future anyway.
 */
export const Navigation: React.FC<{ environment: string }> = ({
  environment,
}) => {
  const groups: Group[] = [
    {
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
    },
    {
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
    },
    {
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
    },
    {
      id: "OtherSites",
      title: "Other Sites",
      links: [
        {
          id: "Dashboard",
          label: "Dashboard",
          url: Route.DashboardUrl(environment),
          external: true,
        },
      ],
    },
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
