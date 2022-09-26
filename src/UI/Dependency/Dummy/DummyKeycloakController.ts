import Keycloak, { KeycloakInitOptions } from "keycloak-js";
import { KeycloakController } from "@/Core";

export class DummyKeycloakController implements KeycloakController {
  getInitConfig(): KeycloakInitOptions {
    throw new Error("Method not implemented.");
  }
  getInstance(): Keycloak {
    throw new Error("Method not implemented.");
  }
  isEnabled(): boolean {
    throw new Error("Method not implemented.");
  }
}
