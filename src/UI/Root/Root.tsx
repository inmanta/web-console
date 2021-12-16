import React, { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DependencyContext } from "@/UI/Dependency";
import { NotFoundPage, PrimaryPageManager } from "@/UI/Pages";
import { SearchSanitizer } from "@/UI/Routing";
import { AuthProvider, PageFrame, Initializer } from "./Components";

export const Root: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const pages = new PrimaryPageManager(
    routeManager.getRouteDictionary()
  ).getPages();

  return (
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
  );
};
