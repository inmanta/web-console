import React from "react";
import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import { useLocation, NavLink } from "react-router-dom";
import { routes } from "@app/routes";

export const PageBreadcrumb = (props) => {
  const location = useLocation();
  const lsmRoutes = routes.find(
    (routeGroup) => routeGroup.pathPrefix === "/lsm"
  );
  let breadcrumbs;
  if (lsmRoutes) {
    breadcrumbs = lsmRoutes.exactRoutes.map((route) => {
      const pathParts = route.path.split("/");
      const pathEnding = pathParts[pathParts.length - 1];
      const isActive = location.pathname.endsWith(pathEnding);
      const isVisible = location.pathname.includes(pathEnding);
      const path = "/lsm" + route.path;
      const LinkElement = !isActive ? (
        <NavLink to={{ pathname: path, search: location.search }}>
          {" "}
          {route.title}{" "}
        </NavLink>
      ) : (
        route.title
      );
      if (isVisible) {
        return (
          <BreadcrumbItem key={path} isActive={isActive}>
            {LinkElement}
          </BreadcrumbItem>
        );
      }
      return;
    });
  }
  breadcrumbs = breadcrumbs.filter((breadcrumb) => !!breadcrumb);
  return <Breadcrumb>{breadcrumbs.length > 0 ? breadcrumbs : null}</Breadcrumb>;
};
