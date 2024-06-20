import React from "react";
import { KeycloakConfig } from "keycloak-js";
import { KeycloakProvider } from "./KeycloakProvider";
import { DatabaseAuthProvider } from "./Providers/DatabaseAuthProvider";
import { KeycloakAuthProvider } from "./Providers/KeycloakAuthProvider";
import { NoAuthProvider } from "./Providers/NoAuthProvider";

export interface AuthConfig extends KeycloakConfig {
  method: "oidc";
}

export interface LocalConfig {
  method: "database";
}
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
