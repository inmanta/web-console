import * as React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { Route, Switch } from "react-router-dom";
import { KeycloakInitOptions } from "keycloak-js";
import { KeycloakProvider } from "react-keycloak";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { Home as HomeRoute } from "@/UI/Routing/Route";
import { SearchSanitizer } from "@/UI/Routing";
import { HomeLayout } from "./HomeLayout";
import { EnvSpecificContentLayout } from "./EnvSpecificContentLayout";

const keycloakInitConfig = {
  onLoad: "login-required",
  flow: "implicit",
} as KeycloakInitOptions;

export const App: React.FunctionComponent<{
  keycloak: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}> = ({ keycloak, shouldUseAuth }) => {
  const AppWithStore = (
    <SearchSanitizer.Provider>
      <Switch>
        <Route exact path={HomeRoute.path}>
          <HomeLayout keycloak={keycloak} shouldUseAuth={shouldUseAuth} />
        </Route>
        <Route>
          <EnvSpecificContentLayout
            keycloak={keycloak}
            shouldUseAuth={shouldUseAuth}
          />
        </Route>
      </Switch>
    </SearchSanitizer.Provider>
  );
  const LoadingSpinner = () => (
    <Bullseye>
      <Spinner size="xl" />
    </Bullseye>
  );

  if (shouldUseAuth) {
    return (
      <KeycloakProvider
        keycloak={keycloak}
        initConfig={keycloakInitConfig}
        LoadingComponent={<LoadingSpinner />}
      >
        {AppWithStore}
      </KeycloakProvider>
    );
  }
  return AppWithStore;
};
