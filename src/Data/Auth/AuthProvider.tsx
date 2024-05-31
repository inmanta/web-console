import React from "react";
import { AuthConfig, LocalConfig } from "./PrimaryAuthController";
import DatabaseAuthProvider from "./Providers/DatabaseAuthProvider";
import KeycloakAuthContext from "./Providers/KeycloakAuthContext";
import NoAuthProvider from "./Providers/NoAuthProvider";

interface AuthProviderProps {
  children: React.ReactNode;
  config: undefined | AuthConfig | LocalConfig;
  keycloakUrl: string | undefined;
}

const AuthProvider = ({ children, config, keycloakUrl }: AuthProviderProps) => {
  if (config?.method === "database") {
    return <DatabaseAuthProvider>{children}</DatabaseAuthProvider>;
  }
  if (config?.method === "oidc") {
    return (
      <KeycloakAuthContext config={{ ...config, url: keycloakUrl }}>
        {children}
      </KeycloakAuthContext>
    );
  }
  return <NoAuthProvider>{children}</NoAuthProvider>;
};

export default AuthProvider;
