import * as React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { Route, Switch } from "react-router-dom";
import { KeycloakInitOptions } from "keycloak-js";
import { KeycloakProvider } from "react-keycloak";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { CreateEnvironment, Home as HomeRoute } from "@/UI/Routing/Route";
import { SearchSanitizer } from "@/UI/Routing";
import { BaseLayout } from "./BaseLayout";
import { EnvSpecificContentLayout } from "./EnvSpecificContentLayout";
import { Initializer } from "./Initializer";
import { Home, CreateEnvironmentPage } from "@/UI/Pages";

interface AuthProps {
  keycloak: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}

export const App: React.FC<AuthProps> = ({ keycloak, shouldUseAuth }) => (
  <Initializer>
    <SearchSanitizer.Provider>
      <AuthWrapper keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
        <Switch>
          <Route exact path={HomeRoute.path}>
            <BaseLayout keycloak={keycloak} shouldUseAuth={shouldUseAuth}>
              <Home />
            </BaseLayout>
          </Route>
          <Route exact path={CreateEnvironment.path}>
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
