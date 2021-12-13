import Keycloak from "keycloak-js";

export interface KeycloakController {
  getInstance(): Keycloak.KeycloakInstance;
  isEnabled(): boolean;
}
