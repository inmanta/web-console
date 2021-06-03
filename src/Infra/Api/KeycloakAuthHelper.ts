import { AuthHelper } from "@/Core";
import { KeycloakInstance } from "keycloak-js";

export class KeycloakAuthHelper implements AuthHelper {
  constructor(private readonly keycloak?: KeycloakInstance) {}
  getUsername(): string | null {
    return this.keycloak &&
      this.keycloak.profile &&
      this.keycloak.profile.username
      ? this.keycloak.profile.username
      : null;
  }
}
