import { KeycloakConfig } from "keycloak-js";

export type KeycloakAuthConfig = KeycloakConfig & {
  method: "oidc";
};

export interface LocalConfig {
  method: "database" | "jwt";
}
