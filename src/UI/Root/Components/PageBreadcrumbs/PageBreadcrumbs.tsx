import React, { useContext } from "react";
import { useLocation, NavLink } from "react-router";
import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { SearchSanitizer } from "@/UI/Routing";

const decodeUrlLabel = (label: string) => {
  try {
    let decoded = label;
    let prev;

    do {
      prev = decoded;
      decoded = decodeURIComponent(decoded);
    } while (decoded !== prev);

    return decoded;
  } catch {
    return label;
  }
};

export const PageBreadcrumbs: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const { pathname, search } = useLocation();
  const crumbs = routeManager.getCrumbs(pathname);
  const sanitizer = new SearchSanitizer.Sanitizer(routeManager);

  return (
    <Breadcrumb>
      {crumbs.map((crumb) => (
        <BreadcrumbItem key={crumb.kind} isActive={crumb.active} aria-label={"BreadcrumbItem"}>
          {crumb.active ? (
            decodeUrlLabel(crumb.label)
          ) : (
            <NavLink
              to={{
                pathname: crumb.url,
                search: sanitizer.sanitize(crumb.kind, search),
              }}
            >
              {decodeUrlLabel(crumb.label)}
            </NavLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};
