import React, { useCallback, useMemo } from "react";
import Keycloak, { KeycloakConfig } from "keycloak-js";
import { GetAuthContext } from "./AuthContext";

interface Props {
  config: KeycloakConfig;
}

export const KeycloakAuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  config,
}) => {
  const keycloakInstance = useMemo(() => new Keycloak(config), [config]);

  const getUser = useCallback((): string | undefined => {
    return keycloakInstance &&
      keycloakInstance.profile &&
      keycloakInstance.profile.username
      ? keycloakInstance.profile.username
      : undefined;
  }, [keycloakInstance]);

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

  return (
    <GetAuthContext.Provider
      value={{
        getUser,
        getToken,
        login,
        logout,
        updateUser: (_user, _token) => ({}),
      }}
    >
      {children}
    </GetAuthContext.Provider>
  );
};
