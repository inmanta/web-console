import * as React from "react";
import "@patternfly/react-core/dist/styles/base.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AppLayout } from "@/UI/App/AppLayout/AppLayout";
import { AppRoutes } from "@/UI/App/routes";
import "@/UI/App/app.css";
import { KeycloakInitOptions } from "keycloak-js";
import { KeycloakProvider } from "react-keycloak";
import {
  Alert,
  Spinner,
  AlertActionCloseButton,
  Bullseye,
} from "@patternfly/react-core";

const keycloakInitConfig = {
  onLoad: "login-required",
  flow: "implicit",
} as KeycloakInitOptions;

export const App: React.FunctionComponent<{
  keycloak: Keycloak.KeycloakInstance;
  shouldUseAuth: boolean;
}> = (props) => {
  const [errorMessage, setErrorMessage] = React.useState("");
  const shouldAddBaseName = process.env.NODE_ENV === "production";
  const baseName = shouldAddBaseName ? "/console" : "/";

  const AppWithStore = (
    <Router basename={baseName}>
      <AppLayout
        logoBaseUrl={baseName}
        keycloak={props.shouldUseAuth ? props.keycloak : undefined}
        setErrorMessage={setErrorMessage}
        shouldUseAuth={props.shouldUseAuth}
      >
        {errorMessage && (
          <Alert
            variant="danger"
            title={errorMessage}
            actionClose={
              <AlertActionCloseButton onClose={() => setErrorMessage("")} />
            }
          />
        )}
        <AppRoutes />
      </AppLayout>
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
