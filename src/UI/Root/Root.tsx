import React, { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { LoginPage } from "@/Slices/Login";
import { DependencyContext } from "@/UI/Dependency";
import { RouteOutlet, SearchSanitizer } from "@/UI/Routing";
import { GlobalStyles } from "@/UI/Styles";
import { NotFoundPage } from "@S/NotFound/UI";
import {
  getThemePreference,
  setThemePreference,
} from "../Components/DarkmodeOption";
import { PageFrame } from "./Components";
import { PrimaryPageManager } from "./PrimaryPageManager";

export const Root: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);

  const themePreference = getThemePreference();

  setThemePreference(themePreference || "light");

  const pageManager = useMemo(
    () => new PrimaryPageManager(routeManager.getRouteDictionary()),
    [routeManager],
  );

  const [pages, setPages] = useState(pageManager.getPages());

  useEffect(() => {
    setPages(pageManager.getPages());
  }, [pageManager]);

  // This is done because the StyledComponents package is not fully compatible with React 18 typing definitions.
  // https://github.com/styled-components/styled-components/issues/3738
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GlobalStyleProxy: any = GlobalStyles;

  return (
    <>
      <ReactQueryDevtools initialIsOpen={false} />
      <GlobalStyleProxy />
      <SearchSanitizer.Provider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RouteOutlet />}>
            {routeManager.isBaseUrlDefined() && (
              <Route
                path="/"
                element={
                  <Navigate to={routeManager.getUrl("Home", undefined)} />
                }
              />
            )}
            <Route
              path="*"
              element={
                <PageFrame environmentRole="Optional">
                  <NotFoundPage />
                </PageFrame>
              }
            />
            {pages.map(({ path, kind, element, environmentRole }) => (
              <Route
                path={path}
                element={
                  <PageFrame environmentRole={environmentRole}>
                    {element}
                  </PageFrame>
                }
                key={kind}
              />
            ))}
          </Route>
        </Routes>
      </SearchSanitizer.Provider>
    </>
  );
};
