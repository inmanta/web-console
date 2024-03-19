import Keycloak, { KeycloakInitOptions } from "keycloak-js";

export interface AuthController {
  getInstance(): Keycloak;
  isEnabled(): boolean;
  getInitConfig(): KeycloakInitOptions;
  shouldAuthLocally(): boolean;
  getLocalUserName(): string;
  setLocalUserName(username: string): void;
  logout(): void;
}
