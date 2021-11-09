import React, { useContext } from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { KeycloakProvider } from "react-keycloak";
import { Route, Switch } from "react-router-dom";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { KeycloakInitOptions } from "keycloak-js";
import { DependencyContext } from "@/UI/Dependency";
import { Home, CreateEnvironmentPage } from "@/UI/Pages";
import { SearchSanitizer } from "@/UI/Routing";
import { BaseLayout } from "./BaseLayout";
import { EnvSpecificContentLayout } from "./EnvSpecificContentLayout";
import { Initializer } from "./Initializer";

interface AuthProps {
  keycloak: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}

export const App: React.FC<AuthProps> = ({ keycloak, shouldUseAuth }) => {
  const { routeManager } = useContext(DependencyContext);
  return (
    <Initializer>
      <SearchSanitizer.Provider>
        <AuthWrapper keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
          <Switch>
            <Route exact path={routeManager.getUrl("Home", undefined)}>
              <BaseLayout keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
                <Home />
              </BaseLayout>
            </Route>
            <Route
              exact
              path={routeManager.getUrl("CreateEnvironment", undefined)}
            >
              <BaseLayout keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
                <CreateEnvironmentPage />
              </BaseLayout>
            </Route>
            <Route>
              <EnvSpecificContentLayout
                keycloak={keycloak}
                shouldUseAuth={shouldUseAuth}
              />
            </Route>
          </Switch>
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
