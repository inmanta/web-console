import React from "react";
import { RouteObject } from "react-router";
import { FeatureModule, getFeatureRoutes } from "@inmanta/web-console-core";
import { PrimaryRouteManager } from "@inmanta/web-console-core/Routing/PrimaryRouteManager";
import { LoginPage } from "@inmanta/web-console-shell/Slices/Login";
import { PageFrame } from "./Components";
import { DefaultRoute } from "./Components/DefaultRoute";
import { PrimaryPageManager } from "./PrimaryPageManager";
import { RouteOutlet } from "./RouteOutlet";
import { RuntimeFeatureRoutes } from "./RuntimeFeatures/RuntimeFeatureRoutes";

/**
 * Builds the route objects of the app, to be rendered inside the `Root` layout.
 *
 * The page routes are registered on the data router itself instead of in descendant `<Routes>`
 * under a `/*` route. React Router compiles splats to `(.*)$` without the `s` flag, so a splat
 * never matches a pathname containing a decoded newline (e.g. a resource id with a multi-line
 * attribute). Param segments do match newlines, so the page routes resolve those urls.
 *
 * @param basePathname - The base pathname the app is served from, e.g. "/console".
 * @param features - The features the app ships. The pages are built from their routes.
 * @returns The route objects of the login page, the default route, the pages, and the catch-all
 *   route with the pages of the features loaded at runtime and the not-found page.
 */
export const createRootRoutes = (
  basePathname: string,
  features: FeatureModule[]
): RouteObject[] => {
  const routeManager = PrimaryRouteManager(basePathname, getFeatureRoutes(features));
  const pages = PrimaryPageManager(routeManager.getRoutes(), features).getPages();

  return [
    { path: `${basePathname}/login`, element: <LoginPage /> },
    {
      element: <RouteOutlet />,
      children: [
        { path: "/", element: <DefaultRoute /> },
        { path: basePathname, element: <DefaultRoute /> },
        ...pages.map(({ path, kind, element, environmentRole }) => ({
          id: kind,
          path,
          element: <PageFrame environmentRole={environmentRole}>{element}</PageFrame>,
        })),
        // The pages of the features loaded at runtime, which aren't known yet when the route table
        // is built, and not-found. The same page frame as the other pages, so it stays mounted
        // when navigating between them.
        {
          path: "*",
          element: (
            <PageFrame>
              <RuntimeFeatureRoutes />
            </PageFrame>
          ),
        },
      ],
    },
  ];
};
