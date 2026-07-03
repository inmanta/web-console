import React, { useState } from "react";
import { AuthProvider as OidcContextProvider, useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router";
import { Bullseye, Button, Content, Spinner, Stack, StackItem, Title } from "@patternfly/react-core";
import { words } from "@/UI";
import { PrimaryBaseUrlManager } from "@/UI/Routing";
import { AuthContext } from "../AuthContext";
import { OidcAuthConfig } from "../types";
import { clearLocalToken, getLocalToken, getLocalUsername, setLocalToken } from "./localToken";

interface OidcFallbackChooserProps {
  errorMessage?: string;
  onIdpLogin: () => void;
  onLocalLogin: () => void;
}

/**
 * Break-glass screen shown when the identity provider cannot authenticate the user
 * and the database local login fallback is enabled. It offers a retry against the
 * IdP and a route to the local database login form.
 */
const OidcFallbackChooser: React.FC<OidcFallbackChooserProps> = ({
  errorMessage,
  onIdpLogin,
  onLocalLogin,
}) => (
  <Bullseye>
    <Stack hasGutter style={{ maxWidth: "30rem", textAlign: "center" }}>
      <StackItem>
        <Title headingLevel="h1" size="lg">
          {words("login.title")}
        </Title>
      </StackItem>
      <StackItem>
        <Content component="p">
          {errorMessage
            ? words("error.authentication")(errorMessage)
            : words("login.fallback.description")}
        </Content>
      </StackItem>
      <StackItem>
        <Button variant="primary" isBlock onClick={onIdpLogin}>
          {words("login.fallback.idp")}
        </Button>
      </StackItem>
      <StackItem>
        <Button variant="secondary" isBlock onClick={onLocalLogin} aria-label="local-login-fallback">
          {words("login.fallback.local")}
        </Button>
      </StackItem>
    </Stack>
  </Bullseye>
);

interface InnerProps {
  localFallback: boolean;
}

/**
 * Inner provider that bridges react-oidc-context to our AuthContext.
 *
 * When localFallback is enabled and the IdP cannot authenticate the user, the
 * provider does not dead-end on a redirect: it keeps the /login route reachable
 * and offers a database login so an admin can get in when the IdP is unavailable.
 */
const OidcInnerProvider: React.FC<React.PropsWithChildren<InnerProps>> = ({
  children,
  localFallback,
}) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [localUser, setLocalUser] = useState<string | null>(getLocalUsername());

  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname
  );
  const basePathname = baseUrlManager.getBasePathname();
  const loginPath = `${basePathname}/login`;

  const hasLocalSession = (): boolean => !!getLocalToken();

  const getUser = (): string | null => {
    if (auth.user?.profile) {
      return (
        (auth.user.profile.preferred_username as string) ||
        auth.user.profile.email ||
        auth.user.profile.sub ||
        null
      );
    }

    return localUser;
  };

  const getToken = (): string | null => auth.user?.access_token || getLocalToken();

  const updateUser = (username: string, token: string): void => {
    setLocalToken(username, token);
    setLocalUser(username);
  };

  const logout = (): void => {
    if (hasLocalSession()) {
      clearLocalToken();
      setLocalUser(null);
      navigate(loginPath);

      return;
    }
    auth.signoutRedirect();
  };

  const login = (): void => {
    // A 401 also triggers this. If we hold a local fallback session (its token is no
    // longer valid), or the user is on the local login page (e.g. a failed login
    // attempt returns 401), return to the login form instead of bouncing to the IdP.
    if (hasLocalSession() || location.pathname.endsWith("/login")) {
      clearLocalToken();
      setLocalUser(null);
      navigate(loginPath);

      return;
    }
    auth.signinRedirect();
  };

  const isDisabled = (): boolean => !getUser();

  const isDatabaseSession = (): boolean => !auth.isAuthenticated && hasLocalSession();

  const contextValue = {
    getUser,
    getToken,
    login,
    logout,
    isDisabled,
    updateUser,
    isDatabaseSession,
  };

  if (auth.isLoading) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  // Authenticated through the IdP, or holding a local fallback session: render the app.
  if (auth.isAuthenticated || hasLocalSession()) {
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
  }

  // Manual break-glass: when the fallback is enabled the /login route stays reachable by
  // URL, so an admin can deliberately choose local login even while the IdP is healthy.
  if (localFallback && location.pathname.endsWith("/login")) {
    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
  }

  // Identity provider first: as long as the IdP has not errored, redirect to it just like
  // a normal OIDC login.
  if (!auth.error) {
    auth.signinRedirect();

    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  // The IdP failed to authenticate the user. Offer the database login as a backup when it
  // is enabled; otherwise show the error as before.
  if (localFallback) {
    return (
      <OidcFallbackChooser
        errorMessage={auth.error.message}
        onIdpLogin={() => auth.signinRedirect()}
        onLocalLogin={() => navigate(loginPath)}
      />
    );
  }

  return <Bullseye>{words("error.authentication")(auth.error.message || "")}</Bullseye>;
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
    post_logout_redirect_uri: config.postLogoutRedirectUri || window.location.origin,
    scope: config.scope || "openid profile email",
    response_type: "code",
    automaticSilentRenew: true,
    ...(config.extraConfig || {}),
  };

  return (
    <OidcContextProvider {...oidcConfig}>
      <OidcInnerProvider localFallback={!!config.localFallback}>{children}</OidcInnerProvider>
    </OidcContextProvider>
  );
};
