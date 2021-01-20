import { ReactElement } from "react";
import {
  ResourceModal,
  ServiceInstanceForResources,
} from "@app/ServiceInventory/ResourceModal";
import { ActionPresenter } from "./ActionPresenter";
import { KeycloakInstance } from "keycloak-js";

export class ResourcesPresenter implements ActionPresenter {
  constructor(
    private readonly instances: ServiceInstanceForResources[],
    private readonly keycloak: KeycloakInstance | undefined
  ) {}

  private getInstanceForId(
    id: string
  ): ServiceInstanceForResources | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getForId(id: string): ReactElement | null {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") return null;
    return ResourceModal({ instance, keycloak: this.keycloak });
  }
}
