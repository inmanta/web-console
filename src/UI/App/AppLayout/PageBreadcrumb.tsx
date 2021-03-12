import React from "react";
import { Breadcrumb, BreadcrumbItem } from "@patternfly/react-core";
import { useLocation, NavLink } from "react-router-dom";
import { routes } from "@/UI/App/routes";

export const PageBreadcrumb: React.FC = () => {
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
      let path = "/lsm" + route.path;
      if (location.pathname.endsWith("add")) {
        if (pathParts.length === 4) {
          pathParts[2] = location.pathname.split("/")[3];
          path = "/lsm" + pathParts.join("/");
        }
      }

      if (location.pathname.endsWith("history")) {
        if (route.title === "Service Inventory") {
          pathParts[2] = location.pathname.split("/")[3];
          path = "/lsm" + pathParts.join("/");
        }
      }
      const LinkElement = !isActive ? (
        <NavLink to={{ pathname: path, search: location.search }}>
          {route.title}
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
