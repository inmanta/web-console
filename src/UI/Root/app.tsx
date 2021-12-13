import React, { useContext } from "react";
import { KeycloakProvider } from "react-keycloak";
import { Route, Routes } from "react-router-dom";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { Home, CreateEnvironmentPage, StatusPage, NotFound } from "@/UI/Pages";
import { SearchSanitizer } from "@/UI/Routing";
import { BaseLayout } from "./BaseLayout";
import { EnvSpecificContentLayout } from "./EnvSpecificContentLayout";
import { Initializer } from "./Initializer";
import { PrimaryPageManager } from "./PrimaryPageManager";

export const App: React.FC = () => {
  const { routeManager } = useContext(DependencyContext);
  const pages = new PrimaryPageManager(
    routeManager.getRouteDictionary()
  ).getPages();

  return (
    <Initializer>
      <SearchSanitizer.Provider>
        <AuthWrapper>
          <Routes>
            <Route
              path={routeManager.getUrl("Home", undefined)}
              element={
                <BaseLayout>
                  <Home />
                </BaseLayout>
              }
            />
            <Route
              path={routeManager.getUrl("CreateEnvironment", undefined)}
              element={
                <BaseLayout>
                  <CreateEnvironmentPage />
                </BaseLayout>
              }
            />
            <Route
              path={routeManager.getUrl("Status", undefined)}
              element={
                <BaseLayout>
                  <StatusPage />
                </BaseLayout>
              }
            />
            {pages.map(({ path, kind, element }) => (
              <Route
                path={path}
                element={
                  <EnvSpecificContentLayout>{element}</EnvSpecificContentLayout>
                }
                key={kind}
              />
            ))}
            <Route
              path="*"
              element={
                <EnvSpecificContentLayout>
                  <NotFound />
                </EnvSpecificContentLayout>
              }
            />
          </Routes>
        </AuthWrapper>
      </SearchSanitizer.Provider>
    </Initializer>
  );
};

const AuthWrapper: React.FC = ({ children }) => {
  const { keycloakController } = useContext(DependencyContext);

  if (!keycloakController.isEnabled()) return <>{children}</>;

  return (
    <KeycloakProvider
      keycloak={keycloakController.getInstance()}
      initConfig={keycloakController.getInitConfig()}
      LoadingComponent={
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      }
    >
      {children}
    </KeycloakProvider>
  );
};
