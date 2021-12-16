import Keycloak, { KeycloakInitOptions } from "keycloak-js";

export interface KeycloakController {
  getInstance(): Keycloak.KeycloakInstance;
  isEnabled(): boolean;
  getInitConfig(): KeycloakInitOptions;
}
