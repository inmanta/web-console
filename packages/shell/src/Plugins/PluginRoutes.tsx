import React, { useContext, useMemo } from "react";
import { Route, Routes } from "react-router";
import { getFeatureRoutes } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { NotFoundPage } from "@inmanta/web-console-shell/Slices/NotFound/UI";
import { PageFrame } from "../Components";
import { PrimaryPageManager } from "../PrimaryPageManager";
import { useAppFeatures } from "./AppFeatures";

/**
 * The pages of the app's plugins, rendered by the catch-all route, with the not-found page for
 * every other url.
 *
 * The route table of the router is built before the plugins are loaded, so their pages can't be
 * in it. They render here instead, as descendant routes, and get their params like the other pages.
 * Unlike those, a plugin route doesn't match a url whose decoded path contains a newline (see
 * `CustomRouter`), which their params (service names, instance ids) never do.
 */
export const PluginRoutes: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const { pluginFeatures } = useAppFeatures();

  const pages = useMemo(() => {
    const kinds = new Set(getFeatureRoutes(pluginFeatures).map((route) => route("").kind));
    const routes = routeManager.getRoutes().filter(({ kind }) => kinds.has(kind));

    return PrimaryPageManager(routes, pluginFeatures).getPages();
  }, [routeManager, pluginFeatures]);

  return (
    <Routes>
      {pages.map(({ path, kind, element, environmentRole }) => (
        <Route
          key={kind}
          path={path}
          element={<PageFrame environmentRole={environmentRole}>{element}</PageFrame>}
        />
      ))}
      <Route
        path="*"
        element={
          <PageFrame environmentRole="Required">
            <NotFoundPage />
          </PageFrame>
        }
      />
    </Routes>
  );
};
