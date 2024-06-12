import React from "react";
import { AuthConfig, LocalConfig } from "./PrimaryAuthController";
import { DatabaseAuthProvider } from "./Providers/DatabaseAuthProvider";
import { KeycloakAuthProvider } from "./Providers/KeycloakAuthProvider";
import { NoAuthProvider } from "./Providers/NoAuthProvider";

interface Props {
  config: undefined | AuthConfig | LocalConfig;
  keycloakUrl: string | undefined;
}

export const AuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  config,
  keycloakUrl,
}) => {
  switch (config?.method) {
    case "database":
      return <DatabaseAuthProvider>{children}</DatabaseAuthProvider>;
    case "oidc":
      return (
        <KeycloakAuthProvider config={{ ...config, url: keycloakUrl }}>
          {children}
        </KeycloakAuthProvider>
      );
    default:
      return <NoAuthProvider>{children}</NoAuthProvider>;
  }
};
