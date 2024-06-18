import React, { useEffect } from "react";
import { useKeycloak } from "@react-keycloak/web";
import { AuthContext } from "../AuthContext";

/**
 * KeycloakAuthProvider component provides authentication functionality using Keycloak.
 */
export const KeycloakAuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { keycloak } = useKeycloak();
  /**
   * Get the username of the currently logged-in user.
   * @returns The username of the currently logged-in user, or undefined if no user is logged in.
   */
  const getUser = (): string | undefined => {
    return keycloak && keycloak.profile && keycloak.profile.username
      ? keycloak.profile.username
      : undefined;
  };

  /**
   * Log out the currently logged-in user.
   */
  const logout = () => {
    keycloak.logout();
  };

  /**
   * Clear the token and initiate the Keycloak login flow.
   */
  const login = () => {
    keycloak.clearToken();
    keycloak.login();
  };

  /**
   * Get the access token of the currently logged-in user.
   * @returns The access token of the currently logged-in user, or undefined if no user is logged in.
   */
  const getToken = () => {
    return keycloak.token;
  };

  useEffect(() => {
    if (keycloak && !keycloak.profile) {
      keycloak.loadUserProfile();
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [keycloak.authenticated]);

  return (
    <AuthContext.Provider
      value={{
        getUser,
        getToken,
        login,
        logout,
        updateUser: (_user: string, _token: string) => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
