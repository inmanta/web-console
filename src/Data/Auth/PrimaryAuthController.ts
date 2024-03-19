import Keycloak, { KeycloakConfig, KeycloakInitOptions } from "keycloak-js";
import { AuthController } from "@/Core";
import { removeCookie } from "../Common/CookieHelper";
import keycloakConf from "./keycloak.json";

interface AuthConfig extends KeycloakConfig {
  method: "oidc";
}

interface LocalConfig {
  method: "database";
}

/**
 * PrimaryAuthController class.
 * This class is responsible for handling authentication.
 */
export class PrimaryAuthController implements AuthController {
  private instance: Keycloak;

  /**
   * PrimaryAuthController constructor.
   * @param {string | undefined} shouldUseAuth - Flag indicating whether authentication should be used.
   * @param {undefined | AuthConfig | LocalConfig} externalConfig - The external configuration for authentication.
   * @param {string | undefined} keycloakUrl - The URL of the Keycloak server.
   */
  constructor(
    private readonly shouldUseAuth: string | undefined,
    private readonly externalConfig: undefined | AuthConfig | LocalConfig,
    private readonly keycloakUrl: string | undefined,
  ) {
    this.instance = new Keycloak(this.getConfig());
  }

  /**
   * Get the initial configuration for Keycloak.
   * @returns {KeycloakInitOptions} The initial configuration for Keycloak.
   */
  getInitConfig(): KeycloakInitOptions {
    return {
      onLoad: "login-required",
      checkLoginIframe: false,
      flow: "implicit",
    };
  }

  /**
   * Get the Keycloak instance.
   * @returns {Keycloak} The Keycloak instance.
   */
  getInstance(): Keycloak {
    return this.instance;
  }

  /**
   * Get the configuration for Keycloak.
   * @returns {KeycloakConfig} The configuration for Keycloak.
   */
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

  /**
   * Get the local username.
   * @returns {string} The local username.
   */
  getLocalUserName(): string {
    return localStorage.getItem("inmanta_user") || "Unknown user";
  }

  /**
   * Set the local username.
   * @param {string} username - The username to set.
   */
  setLocalUserName(username: string): void {
    localStorage.setItem("inmanta_user", username);
  }

  /**
   * Check if authentication should be done locally.
   * @returns {boolean} True if authentication should be done locally, false otherwise.
   */
  shouldAuthLocally(): boolean {
    return (
      typeof this.externalConfig !== "undefined" &&
      this.externalConfig.method === "database"
    );
  }

  /**
   * Logs out the user either locally or using Keycloak.
   */
  logout(): void {
    if (this.shouldAuthLocally()) {
      removeCookie("inmanta_user");
      localStorage.removeItem("inmanta_user");
      document.dispatchEvent(new CustomEvent("open-login"));
    } else {
      this.instance.logout();
    }
  }

  /**
   * Check if authentication is enabled.
   * @returns {boolean} True if authentication is enabled, false otherwise.
   */
  isEnabled(): boolean {
    return (
      this.shouldUseAuth === "true" ||
      typeof this.externalConfig !== "undefined"
    );
  }
}
