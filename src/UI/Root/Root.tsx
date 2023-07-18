import React, { useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DependencyContext } from "@/UI/Dependency";
import { SearchSanitizer } from "@/UI/Routing";
import { GlobalStyles } from "@/UI/Styles";
import useFeatures from "@/UI/Utils/useFeatures";
import { NotFoundPage } from "@S/NotFound/UI";
import { ExpertBanner } from "../Components/ExpertBanner";
import { AuthProvider, PageFrame, Initializer } from "./Components";
import { PrimaryPageManager } from "./PrimaryPageManager";

export const Root: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const features = useFeatures();

  const pageManager = useMemo(
    () => new PrimaryPageManager(routeManager.getRouteDictionary()),
    [routeManager]
  );

  const [pages, setPages] = useState(pageManager.getPages(features));

  useEffect(() => {
    setPages(pageManager.getPages(features));
  }, [features, pageManager]);

  // This is done because the StyledComponents package is not fully compatible with React 18 typing definitions.
  // https://github.com/styled-components/styled-components/issues/3738
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const GlobalStyleProxy: any = GlobalStyles;

  return (
    <>
      <ExpertBanner />
      <GlobalStyleProxy />
      <AuthProvider>
        <Initializer>
          <SearchSanitizer.Provider>
            <Routes>
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
            </Routes>
          </SearchSanitizer.Provider>
        </Initializer>
      </AuthProvider>
    </>
  );
};
