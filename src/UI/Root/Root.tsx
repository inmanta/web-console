import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DependencyContext } from "@/UI/Dependency";
import { SearchSanitizer } from "@/UI/Routing";
import { GlobalStyles } from "@/UI/Styles";
import { NotFoundPage } from "@S/NotFound/UI";
import { AuthProvider, PageFrame, Initializer } from "./Components";
import { PrimaryPageManager } from "./PrimaryPageManager";

export const Root: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const pages = new PrimaryPageManager(
    routeManager.getRouteDictionary()
  ).getPages();

  return (
    <>
      <GlobalStyles />
      <Initializer>
        <SearchSanitizer.Provider>
          <AuthProvider>
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
          </AuthProvider>
        </SearchSanitizer.Provider>
      </Initializer>
    </>
  );
};
