import React, { useContext } from "react";
import { useLocation } from "react-router";
import { Breadcrumb } from "@patternfly/react-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { SearchSanitizer } from "@inmanta/web-console-core/Routing";
import { PageCrumb } from "./PageCrumb";

export const PageBreadcrumbs: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const { pathname, search } = useLocation();
  const crumbs = routeManager.getCrumbs(pathname);
  const sanitizer = new SearchSanitizer.Sanitizer(routeManager);

  return (
    <Breadcrumb>
      {crumbs.map((crumb) => (
        <PageCrumb key={crumb.kind} crumb={crumb} search={sanitizer.sanitize(crumb.kind, search)} />
      ))}
    </Breadcrumb>
  );
};
