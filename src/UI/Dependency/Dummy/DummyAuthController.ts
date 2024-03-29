import Keycloak, { KeycloakInitOptions } from "keycloak-js";
import { AuthController } from "@/Core";

export class DummyAuthController implements AuthController {
  getInitConfig(): KeycloakInitOptions {
    throw new Error("Method not implemented.");
  }
  getInstance(): Keycloak {
    throw new Error("Method not implemented.");
  }
  isEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
  shouldAuthLocally(): boolean {
    throw new Error("Method not implemented.");
  }
  getLocalUserName(): string {
    throw new Error("Method not implemented.");
  }
  setLocalUserName(_username: string): void {
    throw new Error("Method not implemented.");
  }
  logout(): void {
    throw new Error("Method not implemented.");
  }
  getToken(): string {
    throw new Error("Method not implemented.");
  }
}
