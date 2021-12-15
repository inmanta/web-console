import React, { useContext } from "react";
import { KeycloakProvider } from "react-keycloak";
import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { NotFoundPage } from "@/UI/Pages";
import { SearchSanitizer } from "@/UI/Routing";
import { AppFrame } from "./AppFrame";
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
              path="/"
              element={<Navigate to={routeManager.getUrl("Home", undefined)} />}
            />
            <Route
              path="*"
              element={
                <AppFrame environmentRole="Optional">
                  <NotFoundPage />
                </AppFrame>
              }
            />
            {pages.map(({ path, kind, element, environmentRole }) => (
              <Route
                path={path}
                element={
                  <AppFrame environmentRole={environmentRole}>
                    {element}
                  </AppFrame>
                }
                key={kind}
              />
            ))}
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
