import React from "react";
import { DatabaseAuthProvider } from "./Providers/DatabaseAuthProvider";
import { JwtAuthProvider } from "./Providers/JwtAuthProvider";
import { KeycloakAuthProvider } from "./Providers/KeycloakAuthProvider";
import { NoAuthProvider } from "./Providers/NoAuthProvider";
import { OidcAuthProvider } from "./Providers/OidcAuthProvider";
import { KeycloakAuthConfig, LocalConfig, OidcAuthConfig } from "./types";

interface Props {
  config: undefined | KeycloakAuthConfig | OidcAuthConfig | LocalConfig;
}

/**
 * Renders the appropriate authentication provider based on the config emitted
 * by inmanta-ui into config.js (window.auth).
 *
 * Two OIDC modes exist side-by-side:
 *
 * - "oidc" (KeycloakAuthProvider) — Legacy Keycloak-specific provider that
 *   uses keycloak-js with the **implicit flow** (response_type "token").
 *   Existing deployments rely on this flow, so it is kept for backwards
 *   compatibility. It is intended to be deprecated in the future in favor
 *   of "oidc-generic".
 *
 * - "oidc-generic" (OidcAuthProvider) — Standards-based provider built on
 *   oidc-client-ts / react-oidc-context. Uses the **authorization code
 *   flow with PKCE** (response_type "code"), which is the recommended
 *   approach per OAuth 2.1. Works with any OIDC-compliant IdP (MS Entra
 *   ID, Okta, Auth0, Keycloak, etc.).
 *
 * Flow comparison:
 *
 *   Implicit flow (legacy "oidc"):
 *     Browser → IdP login → redirect back with access token in URL fragment.
 *     Simple, but the token is exposed in the URL (browser history, logs,
 *     referrer headers). No refresh tokens are issued, so the user must
 *     re-authenticate when the token expires.
 *
 *   Authorization code flow with PKCE ("oidc-generic"):
 *     Browser → IdP login → redirect back with a short-lived auth code →
 *     browser exchanges code for tokens via a back-channel POST (protected
 *     by a PKCE code verifier). Tokens never appear in the URL. Refresh
 *     tokens enable silent renewal without user interaction.
 *
 * Why not unify them? oidc-client-ts explicitly dropped implicit flow
 * support (OAuth 2.1 compliance), so it cannot be used as a drop-in
 * replacement for the legacy Keycloak implicit-flow path.
 */
export const AuthProvider: React.FC<React.PropsWithChildren<Props>> = ({ children, config }) => {
  switch (config?.method) {
    case "database":
      return <DatabaseAuthProvider>{children}</DatabaseAuthProvider>;
    case "oidc":
      return <KeycloakAuthProvider config={config}>{children}</KeycloakAuthProvider>;
    case "oidc-generic":
      return <OidcAuthProvider config={config}>{children}</OidcAuthProvider>;
    case "jwt":
      return <JwtAuthProvider>{children}</JwtAuthProvider>;
    default:
      return <NoAuthProvider>{children}</NoAuthProvider>;
  }
};
