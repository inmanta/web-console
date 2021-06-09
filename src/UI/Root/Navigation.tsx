import React from "react";
import { NavLink } from "react-router-dom";
import { Nav, NavItem, NavGroup } from "@patternfly/react-core";
import { CatalogPage } from "@/UI/Routing";

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
      id: "LifecycleServiceManagement",
      title: "Lifecycle Service Management",
      links: [
        {
          id: CatalogPage.kind,
          label: CatalogPage.label,
          url: CatalogPage.path,
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
          url: `/dashboard/#!/environment/${environment}`,
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
        to={{ pathname: url, search: location.search }}
        activeClassName="pf-m-current"
      >
        {label}
      </NavLink>
    )}
  </NavItem>
);
