import React from "react";
import { NavLink } from "react-router-dom";
import { Nav, NavItem, NavGroup } from "@patternfly/react-core";
import { routes } from "@/UI/App/routes";

interface Props {
  environment: string;
}

export const Navigation: React.FC<Props> = ({ environment }) => (
  <Nav id="nav-primary-simple" theme="dark">
    {routes.map((routeItem, idx) => {
      return (
        <NavGroup title={routeItem.name} key={`${routeItem.name}-${idx}`}>
          {routeItem.exactRoutes.map((route, index) => {
            return !route.hideOnSideBar ? (
              <NavItem
                key={`${route.label}-${index}`}
                id={`${route.label}-${index}`}
              >
                <NavLink
                  exact={true}
                  to={{
                    pathname: routeItem.pathPrefix + route.path,
                    search: location.search,
                  }}
                  activeClassName="pf-m-current"
                >
                  {route.label}
                </NavLink>
              </NavItem>
            ) : null;
          })}
        </NavGroup>
      );
    })}
    <NavGroup title="Other sites" key="external">
      <li className="pf-c-nav__item">
        <a
          className="pf-c-nav__link"
          href={`/dashboard/#!/environment/${environment}`}
          target="_blank"
          rel="noreferrer"
        >
          Dashboard
        </a>
      </li>
    </NavGroup>
  </Nav>
);
