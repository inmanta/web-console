import Keycloak from "keycloak-js";
import { AuthHelper } from "@/Core";

export class KeycloakAuthHelper implements AuthHelper {
  constructor(private readonly keycloak?: Keycloak) {}

  isDisabled(): boolean {
    return this.getUsername() === null;
  }

  getUsername(): string | null {
    return this.keycloak &&
      this.keycloak.profile &&
      this.keycloak.profile.username
      ? this.keycloak.profile.username
      : null;
  }
}
