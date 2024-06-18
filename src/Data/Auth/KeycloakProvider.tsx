import React from "react";
import { Bullseye, Spinner } from "@patternfly/react-core";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import Keycloak from "keycloak-js";
import { AuthConfig } from "./PrimaryAuthController";

interface Props {
  config: AuthConfig;
}

/**
 * KeycloakAuthProvider component provides authentication functionality using Keycloak.
 */
export const KeycloakProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  config,
}) => {
  const keycloakInstance = new Keycloak(config);

  return (
    <ReactKeycloakProvider
      authClient={keycloakInstance}
      initOptions={{
        onLoad: "login-required",
        checkLoginIframe: false,
        flow: "implicit",
      }}
      LoadingComponent={
        <Bullseye>
          <Spinner />
        </Bullseye>
      }
    >
      {children}
    </ReactKeycloakProvider>
  );
};
