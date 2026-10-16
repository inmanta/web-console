import React from "react";
import { Navigate, RouteObject } from "react-router";
import { LoginPage } from "@/Slices/Login";
import { PrimaryRouteManager, RouteOutlet } from "@/UI/Routing";
import { NotFoundPage } from "@S/NotFound/UI";
import { PageFrame } from "./Components";
import { PrimaryPageManager } from "./PrimaryPageManager";

/**
 * Builds the route objects of the app, to be rendered inside the `Root` layout.
 *
 * The page routes are registered on the data router itself instead of in descendant `<Routes>`
 * under a `/*` route. React Router compiles splats to `(.*)$` without the `s` flag, so a splat
 * never matches a pathname containing a decoded newline (e.g. a resource id with a multi-line
 * attribute). Param segments do match newlines, so the page routes resolve those urls.
 *
 * @param basePathname - The base pathname the app is served from, e.g. "/console".
 * @returns The route objects of the login page, the home redirect, the pages and the not-found page.
 */
export const createRootRoutes = (basePathname: string): RouteObject[] => {
  const routeManager = PrimaryRouteManager(basePathname);
  const pages = new PrimaryPageManager(routeManager.getRouteDictionary()).getPages();

  return [
    { path: `${basePathname}/login`, element: <LoginPage /> },
    {
      element: <RouteOutlet />,
      children: [
        ...(routeManager.isBaseUrlDefined()
          ? [{ path: "/", element: <Navigate to={routeManager.getUrl("Home", undefined)} /> }]
          : []),
        ...pages.map(({ path, kind, element, environmentRole }) => ({
          id: kind,
          path,
          element: <PageFrame environmentRole={environmentRole}>{element}</PageFrame>,
        })),
        {
          path: "*",
          element: (
            <PageFrame environmentRole="Optional">
              <NotFoundPage />
            </PageFrame>
          ),
        },
      ],
    },
  ];
};
