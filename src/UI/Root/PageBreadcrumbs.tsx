import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import React, { useContext } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { getCrumbs, SearchSanitizer } from "@/UI/Routing";
import { DependencyContext } from "..";

export const PageBreadcrumbs: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const { pathname, search } = useLocation();
  const crumbs = getCrumbs(routeManager, pathname);
  const sanitizer = new SearchSanitizer.Sanitizer(routeManager);
  return (
    <Breadcrumb>
      {crumbs.map((crumb) => (
        <BreadcrumbItem
          key={crumb.kind}
          isActive={crumb.active}
          aria-label={`BreadcrumbItem`}
        >
          {crumb.active ? (
            crumb.label
          ) : (
            <NavLink
              to={{
                pathname: crumb.url,
                search: sanitizer.sanitize(crumb.kind, search),
              }}
            >
              {crumb.label}
            </NavLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};
