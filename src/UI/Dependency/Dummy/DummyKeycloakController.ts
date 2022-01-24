import { KeycloakInitOptions, KeycloakInstance } from "keycloak-js";
import { KeycloakController } from "@/Core";

export class DummyKeycloakController implements KeycloakController {
  getInitConfig(): KeycloakInitOptions {
    throw new Error("Method not implemented.");
  }
  getInstance(): KeycloakInstance {
    throw new Error("Method not implemented.");
  }
  isEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
}
