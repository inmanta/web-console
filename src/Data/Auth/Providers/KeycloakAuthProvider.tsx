import React, { useCallback, useMemo } from "react";
import Keycloak, { KeycloakConfig } from "keycloak-js";
import { GetAuthContext } from "./AuthContext";

interface Props {
  config: KeycloakConfig;
}

/**
 * KeycloakAuthProvider component provides authentication functionality using Keycloak.
 */
export const KeycloakAuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  config,
}) => {
  const keycloakInstance = useMemo(() => new Keycloak(config), [config]);

  /**
   * Get the username of the currently logged-in user.
   * @returns The username of the currently logged-in user, or undefined if no user is logged in.
   */
  const getUser = useCallback((): string | undefined => {
    return keycloakInstance &&
      keycloakInstance.profile &&
      keycloakInstance.profile.username
      ? keycloakInstance.profile.username
      : undefined;
  }, [keycloakInstance]);

  /**
   * Log out the currently logged-in user.
   */
  const logout = () => {
    keycloakInstance.logout();
  };

  /**
   * Clear the token and initiate the Keycloak login flow.
   */
  const login = () => {
    keycloakInstance.clearToken();
    keycloakInstance.login();
  };

  /**
   * Get the access token of the currently logged-in user.
   * @returns The access token of the currently logged-in user, or null if no user is logged in.
   */
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
