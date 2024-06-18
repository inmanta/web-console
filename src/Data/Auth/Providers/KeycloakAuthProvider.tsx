import React, { useEffect } from "react";
import { Bullseye, Spinner } from "@patternfly/react-core";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import Keycloak from "keycloak-js";
import { AuthContext } from "../AuthContext";
import { AuthConfig } from "../PrimaryAuthController";

interface Props {
  config: AuthConfig;
}

/**
 * KeycloakAuthProvider component provides authentication functionality using Keycloak.
 */
export const KeycloakAuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  config,
}) => {
  const keycloakInstance = new Keycloak(config);
  /**
   * Get the username of the currently logged-in user.
   * @returns The username of the currently logged-in user, or undefined if no user is logged in.
   */
  const getUser = (): string | undefined => {
    return keycloakInstance &&
      keycloakInstance.profile &&
      keycloakInstance.profile.username
      ? keycloakInstance.profile.username
      : undefined;
  };

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
   * @returns The access token of the currently logged-in user, or undefined if no user is logged in.
   */
  const getToken = () => {
    return keycloakInstance.token;
  };

  useEffect(() => {
    if (keycloakInstance && !keycloakInstance.profile) {
      keycloakInstance.loadUserProfile().then((profile) => {
        console.log(profile);
        console.log(keycloakInstance.profile);
      });
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [keycloakInstance?.authenticated]);

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
    </ReactKeycloakProvider>
  );
};
