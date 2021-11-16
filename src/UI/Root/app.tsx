import React, { useContext } from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { KeycloakProvider } from "react-keycloak";
import { Route, Routes } from "react-router-dom";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { KeycloakInitOptions } from "keycloak-js";
import { DependencyContext } from "@/UI/Dependency";
import { Home, CreateEnvironmentPage, NotFound } from "@/UI/Pages";
import { SearchSanitizer } from "@/UI/Routing";
import { BaseLayout } from "./BaseLayout";
import { EnvSpecificContentLayout } from "./EnvSpecificContentLayout";
import { Initializer } from "./Initializer";
import { PrimaryPageManager } from "./PrimaryPageManager";

interface AuthProps {
  keycloak: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}

export const App: React.FC<AuthProps> = ({ keycloak, shouldUseAuth }) => {
  const { routeManager } = useContext(DependencyContext);
  const pages = new PrimaryPageManager(
    routeManager.getRouteDictionary()
  ).getPages();

  return (
    <Initializer>
      <SearchSanitizer.Provider>
        <AuthWrapper keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
          <Routes>
            <Route
              path={routeManager.getUrl("Home", undefined)}
              element={
                <BaseLayout keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
                  <Home />
                </BaseLayout>
              }
            />
            <Route
              path={routeManager.getUrl("CreateEnvironment", undefined)}
              element={
                <BaseLayout keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
                  <CreateEnvironmentPage />
                </BaseLayout>
              }
            />
            {pages.map(({ path, kind, element }) => (
              <Route
                path={path}
                element={
                  <EnvSpecificContentLayout
                    keycloak={keycloak}
                    shouldUseAuth={shouldUseAuth}
                  >
                    {element}
                  </EnvSpecificContentLayout>
                }
                key={kind}
              />
            ))}
            <Route
              path="*"
              element={
                <EnvSpecificContentLayout
                  keycloak={keycloak}
                  shouldUseAuth={shouldUseAuth}
                >
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

const AuthWrapper: React.FC<AuthProps> = ({
  children,
  keycloak,
  shouldUseAuth,
}) => {
  const keycloakInitConfig = {
    onLoad: "login-required",
    flow: "implicit",
  } as KeycloakInitOptions;

  return !shouldUseAuth ? (
    <>{children}</>
  ) : (
    <KeycloakProvider
      keycloak={keycloak}
      initConfig={keycloakInitConfig}
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
