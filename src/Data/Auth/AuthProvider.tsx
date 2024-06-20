import React from "react";
import { AuthConfig, KeycloakProvider, LocalConfig } from "./KeycloakProvider";
import { DatabaseAuthProvider } from "./PartialProviders/DatabaseAuthProvider";
import { KeycloakAuthProvider } from "./PartialProviders/KeycloakAuthProvider";
import { NoAuthProvider } from "./PartialProviders/NoAuthProvider";

interface Props {
  config: undefined | AuthConfig | LocalConfig;
}

/**
 * AuthProvider component renders the appropriate authentication provider based on the provided config
 *
 * @param config - The authentication configuration object sent from backend it includes type of authorization that should be initialized, and in case of keycloak authorization its required config {KeycloakConfig}.
 * @returns The rendered authentication provider component.
 */
export const AuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  config,
}) => {
  switch (config?.method) {
    case "database":
      return <DatabaseAuthProvider>{children}</DatabaseAuthProvider>;
    case "oidc":
      return (
        <KeycloakProvider config={config}>
          <KeycloakAuthProvider>{children}</KeycloakAuthProvider>
        </KeycloakProvider>
      );
    default:
      return <NoAuthProvider>{children}</NoAuthProvider>;
  }
};
