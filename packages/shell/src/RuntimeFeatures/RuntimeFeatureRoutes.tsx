import React, { useContext, useMemo } from "react";
import { Route, Routes } from "react-router";
import { getFeatureRoutes } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { NotFoundPage } from "@inmanta/web-console-shell/Slices/NotFound/UI";
import { PrimaryPageManager } from "../PrimaryPageManager";
import { useAppFeatures } from "./AppFeatures";

/**
 * The pages of the features loaded at runtime, with the not-found page for every other url.
 * The catch-all route renders them inside the page frame, like the other pages.
 *
 * The route table of the router is built before these features are loaded, so their pages can't
 * be in it. They render here instead, as descendant routes, and get their params like the other
 * pages. Unlike those, they don't match a url whose decoded path contains a newline (see
 * `CustomRouter`), which their params (service names, instance ids) never do.
 */
export const RuntimeFeatureRoutes: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const { loadedRuntimeFeatures } = useAppFeatures();

  const pages = useMemo(() => {
    const kinds = new Set(getFeatureRoutes(loadedRuntimeFeatures).map((route) => route("").kind));
    const routes = routeManager.getRoutes().filter(({ kind }) => kinds.has(kind));

    return PrimaryPageManager(routes, loadedRuntimeFeatures).getPages();
  }, [routeManager, loadedRuntimeFeatures]);

  return (
    <Routes>
      {pages.map(({ path, kind, element }) => (
        <Route key={kind} path={path} element={element} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
