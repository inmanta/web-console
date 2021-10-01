import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { getCrumbs, isValidKind, Kinds, Route } from "@/UI/Routing";
import { UrlHelper } from "@/Data";
import { isObject } from "@/Core";

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
                search: dropChildStateFromSearchForRoute(crumb.kind, search),
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

const dropChildStateFromSearchForRoute = (
  route: Kinds,
  search: string
): string => {
  const children = Route.getChildrenKindsFromKind(route);
  const urlHelper = new UrlHelper();
  const sanitized = urlHelper.sanitize(search);
  const parsed = urlHelper.parse(sanitized);
  const state = parsed.state;
  if (!isObject(state)) return search;
  const keys = Object.keys(state).filter(
    (key) => isValidKind(key) && !children.includes(key)
  );
  const newState = keys.reduce((acc, curr) => {
    acc[curr] = state[curr];
    return acc;
  }, {});

  return urlHelper.stringify({ ...parsed, state: newState });
};
