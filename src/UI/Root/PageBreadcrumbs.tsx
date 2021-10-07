import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { getCrumbs, SearchSanitizer } from "@/UI/Routing";

const sanitizer = new SearchSanitizer.Sanitizer();

export const PageBreadcrumbs: React.FC = () => {
  const { pathname, search } = useLocation();
  const crumbs = getCrumbs(pathname);
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
