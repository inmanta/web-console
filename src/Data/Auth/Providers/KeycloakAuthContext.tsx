import React, { useState, useEffect, useCallback, useMemo } from "react";
import Keycloak, { KeycloakConfig } from "keycloak-js";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
  config: KeycloakConfig;
}

const KeycloakAuthProvider = ({ children, config }: AuthProviderProps) => {
  const keycloakInstance = useMemo(() => new Keycloak(config), [config]);

  const getName = useCallback((): string | undefined => {
    return keycloakInstance &&
      keycloakInstance.profile &&
      keycloakInstance.profile.username
      ? keycloakInstance.profile.username
      : undefined;
  }, [keycloakInstance]);

  const [user, setUser] = useState<string | undefined>(undefined);

  const logout = () => {
    keycloakInstance.logout();
  };

  const login = () => {
    keycloakInstance.clearToken();
    keycloakInstance.login();
  };
  const getToken = () => {
    return keycloakInstance.token || null;
  };

  useEffect(() => {
    setUser(getName());
  }, [getName]);

  return (
    <AuthContext.Provider
      value={{
        user,
        getToken,
        login,
        logout,
        updateUser: (_user, _token) => ({}),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default KeycloakAuthProvider;
