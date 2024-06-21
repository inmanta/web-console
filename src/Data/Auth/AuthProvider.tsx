import React from "react";
import { DatabaseAuthProvider } from "./Providers/DatabaseAuthProvider";
import { KeycloakAuthProvider } from "./Providers/KeycloakAuthProvider";
import { NoAuthProvider } from "./Providers/NoAuthProvider";
import { KeycloakAuthConfig, LocalConfig } from "./types";

interface Props {
  config: undefined | KeycloakAuthConfig | LocalConfig;
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
        <KeycloakAuthProvider config={config}>{children}</KeycloakAuthProvider>
      );
    default:
      return <NoAuthProvider>{children}</NoAuthProvider>;
  }
};
