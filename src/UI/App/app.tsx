import * as React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AppLayout } from "@/UI/App/AppLayout/AppLayout";
import { AppRoutes } from "@/UI/App/routes";
import "@/UI/App/app.css";
import { KeycloakInitOptions } from "keycloak-js";
import { KeycloakProvider } from "react-keycloak";
import { Spinner, Bullseye } from "@patternfly/react-core";
import { EnvironmentProvider } from "@/UI/Components";
import { EnvironmentHandlerProvider } from "../Dependency/EnvironmentHandlerProvider";

const keycloakInitConfig = {
  onLoad: "login-required",
  flow: "implicit",
} as KeycloakInitOptions;

export const App: React.FunctionComponent<{
  keycloak: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}> = (props) => {
  const shouldAddBaseName = process.env.NODE_ENV === "production";
  const baseName = shouldAddBaseName ? "/console" : "/";

  const AppWithStore = (
    <Router basename={baseName}>
      <EnvironmentHandlerProvider>
        <AppLayout
          logoBaseUrl={baseName}
          keycloak={props.shouldUseAuth ? props.keycloak : undefined}
          shouldUseAuth={props.shouldUseAuth}
        >
          <EnvironmentProvider
            Wrapper={({ children }) => <>{children}</>}
            Dependant={({ environment }) => (
              <AppRoutes environment={environment} />
            )}
          />
        </AppLayout>
      </EnvironmentHandlerProvider>
    </Router>
  );
  const LoadingSpinner = () => (
    <Bullseye>
      <Spinner size="xl" />
    </Bullseye>
  );

  if (props.shouldUseAuth) {
    return (
      <KeycloakProvider
        keycloak={props.keycloak}
        initConfig={keycloakInitConfig}
        LoadingComponent={<LoadingSpinner />}
      >
        {AppWithStore}
      </KeycloakProvider>
    );
  }
  return AppWithStore;
};
