import Keycloak, { KeycloakConfig, KeycloakInitOptions } from "keycloak-js";
import { AuthController } from "@/Core";
import keycloakConf from "./keycloak.json";

interface AuthConfig extends KeycloakConfig {
  method: "oidc";
}
interface LocalConfig {
  method: "database";
}
export class PrimaryAuthController implements AuthController {
  private instance: Keycloak;

  constructor(
    private readonly shouldUseAuth: string | undefined,
    private readonly externalConfig: undefined | AuthConfig | LocalConfig,
    private readonly keycloakUrl: string | undefined,
  ) {
    this.instance = new Keycloak(this.getConfig());
  }

  getInitConfig(): KeycloakInitOptions {
    return {
      onLoad: "login-required",
      checkLoginIframe: false,
      flow: "implicit",
    };
  }

  getInstance(): Keycloak {
    return this.instance;
  }

  private getConfig(): KeycloakConfig {
    if (this.externalConfig && this.externalConfig?.method === "oidc") {
      return this.externalConfig;
    } else {
      return {
        ...keycloakConf,
        url: this.keycloakUrl,
      };
    }
  }
  getLocalUserName(): string {
    return localStorage.getItem("inmanta_user") || "Unknown user";
  }
  setLocalUserName(username: string): void {
    localStorage.setItem("inmanta_user", username);
  }
  shouldAuthLocally(): boolean {
    return (
      typeof this.externalConfig !== "undefined" &&
      this.externalConfig.method === "database"
    );
  }

  isEnabled(): boolean {
    return (
      this.shouldUseAuth === "true" ||
      typeof this.externalConfig !== "undefined"
    );
  }
}
