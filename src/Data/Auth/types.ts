import { KeycloakConfig } from "keycloak-js";

export interface KeycloakAuthConfig extends KeycloakConfig {
  method: "oidc";
}

export interface LocalConfig {
  method: "database";
}
