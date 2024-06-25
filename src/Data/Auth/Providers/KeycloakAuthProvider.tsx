import React, { useEffect } from "react";
import { Bullseye, Spinner } from "@patternfly/react-core";
import { useKeycloak, ReactKeycloakProvider } from "@react-keycloak/web";
import Keycloak from "keycloak-js";
import { AuthContext } from "../AuthContext";
import { KeycloakAuthConfig } from "../types";

/**
 * KeycloakProvider component provides authentication functionality using Keycloak, by using Instance provider by 3rd party library and passing it to  our auth context implementation.
 * It's done in that manner as fetching the context has to be done one level lower that the provider itself.
 */
const KeycloakProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { keycloak } = useKeycloak();
  /**
   * Get the username of the currently logged-in user.
   * @returns  {string|null} The username of the currently logged-in user, or null if no user is logged in.
   */
  const getUser = (): string | null => {
    return keycloak && keycloak.profile && keycloak.profile.username
      ? keycloak.profile.username
      : null;
  };

  /**
   * Log out the currently logged-in user.
   */
  const logout = (): void => {
    keycloak.logout();
  };

  /**
   * Clear the token and initiate the Keycloak login flow.
   */
  const login = (): void => {
    keycloak.clearToken();
    keycloak.login();
  };

  /**
   * Get the access token of the currently logged-in user.
   * @returns {string|null} The access token of the currently logged-in user, or null if no user is logged in.
   */
  const getToken = (): string | null => {
    return keycloak.token || null;
  };
  const isDisabled = () => !getUser();

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
        isDisabled,
        updateUser: (_user: string, _token: string) => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

interface Props {
  config: KeycloakAuthConfig;
}
/**
 * KeycloakAuthProvider component provides authentication functionality using Keycloak.
 */
export const KeycloakAuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
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
      <KeycloakProvider>{children}</KeycloakProvider>
    </ReactKeycloakProvider>
  );
};
