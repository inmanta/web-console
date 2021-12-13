import Keycloak, { KeycloakInstance, KeycloakConfig } from "keycloak-js";
import { KeycloakController } from "@/Core";
import keycloakConf from "./keycloak.json";

export class PrimaryKeycloakController implements KeycloakController {
  private instance: KeycloakInstance;

  constructor(
    private readonly shouldUseAuth: string | undefined,
    private readonly externalConfig: undefined | KeycloakConfig,
    private readonly keycloakUrl: string | undefined
  ) {
    this.instance = Keycloak(this.getConfig());
  }

  getInstance(): KeycloakInstance {
    return this.instance;
  }

  private getConfig(): KeycloakConfig {
    return (
      this.externalConfig || {
        ...keycloakConf,
        url: this.keycloakUrl,
      }
    );
  }

  isEnabled(): boolean {
    return (
      this.shouldUseAuth === "true" ||
      typeof this.externalConfig !== "undefined"
    );
  }
}
