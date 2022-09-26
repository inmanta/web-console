import Keycloak, { KeycloakInitOptions } from "keycloak-js";

export interface KeycloakController {
  getInstance(): Keycloak;
  isEnabled(): boolean;
  getInitConfig(): KeycloakInitOptions;
}
