import { KeycloakConfig } from "keycloak-js";

/**
 * Legacy Keycloak auth config (method: "oidc").
 *
 * Uses keycloak-js with implicit flow. Kept for backwards compatibility with
 * existing deployments. Intended to be deprecated in favor of OidcAuthConfig.
 *
 * @deprecated Prefer "oidc-generic" for new deployments.
 */
export type KeycloakAuthConfig = KeycloakConfig & {
  method: "oidc";
};

/**
 * Generic OIDC auth config (method: "oidc-generic").
 *
 * Works with any OIDC-compliant identity provider (MS Entra ID, Okta, Auth0,
 * Keycloak in code-flow mode, etc.). Uses authorization code flow with PKCE
 * via oidc-client-ts.
 */
export interface OidcAuthConfig {
  method: "oidc-generic";
  authority: string;
  clientId: string;
  redirectUri?: string;
  postLogoutRedirectUri?: string;
  scope?: string;
  extraConfig?: Record<string, unknown>;
}

export interface LocalConfig {
  method: "database" | "jwt";
}
