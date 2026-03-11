import React from "react";
import { AuthProvider as OidcContextProvider, useAuth } from "react-oidc-context";
import { Bullseye, Spinner } from "@patternfly/react-core";
import { AuthContext } from "../AuthContext";
import { OidcAuthConfig } from "../types";

/**
 * Inner provider that bridges react-oidc-context to our AuthContext.
 */
const OidcInnerProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (auth.error) {
    return (
      <Bullseye>
        <div>Authentication error: {auth.error.message}</div>
      </Bullseye>
    );
  }

  if (!auth.isAuthenticated) {
    auth.signinRedirect();

    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  const getUser = (): string | null => {
    if (!auth.user?.profile) return null;

    return (
      (auth.user.profile.preferred_username as string) ||
      auth.user.profile.email ||
      auth.user.profile.sub ||
      null
    );
  };

  const getToken = (): string | null => {
    return auth.user?.access_token || null;
  };

  const logout = (): void => {
    auth.signoutRedirect();
  };

  const login = (): void => {
    auth.signinRedirect();
  };

  const isDisabled = () => !getUser();

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
  config: OidcAuthConfig;
}

/**
 * Generic OIDC auth provider that works with any OpenID Connect compliant
 * identity provider (MS Entra ID, Okta, Auth0, etc.).
 *
 * Uses the authorization code flow with PKCE (response_type "code") via
 * oidc-client-ts. This is the OAuth 2.1 recommended approach and supports
 * automatic silent token renewal via refresh tokens.
 *
 * This provider exists alongside the legacy KeycloakAuthProvider because
 * oidc-client-ts does not support the implicit flow that existing Keycloak
 * deployments rely on. See AuthProvider.tsx for the full rationale.
 */
export const OidcAuthProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  config,
}) => {
  const oidcConfig = {
    authority: config.authority,
    client_id: config.clientId,
    redirect_uri: config.redirectUri || window.location.origin,
    post_logout_redirect_uri:
      config.postLogoutRedirectUri || window.location.origin,
    scope: config.scope || "openid profile email",
    response_type: "code",
    automaticSilentRenew: true,
    ...(config.extraConfig || {}),
  };

  return (
    <OidcContextProvider {...oidcConfig}>
      <OidcInnerProvider>{children}</OidcInnerProvider>
    </OidcContextProvider>
  );
};
