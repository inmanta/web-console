import { ReactElement } from "react";
import { KeycloakInstance } from "keycloak-js";
import { InstanceActions } from "@/UI/Inventory/Components";
import { ActionPresenter, ServiceInstanceForAction } from "./ActionPresenter";
import { InstanceSetStatePresenter } from "./InstanceSetStatePresenter";

export class InstanceActionPresenter implements ActionPresenter {
  constructor(
    private readonly instances: ServiceInstanceForAction[],
    private readonly keycloak: KeycloakInstance | undefined,
    private readonly instanceSetStatePresenter: InstanceSetStatePresenter
  ) {}

  private getInstanceForId(id: string): ServiceInstanceForAction | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getForId(id: string): ReactElement | null {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") return null;
    return InstanceActions({
      instance,
      keycloak: this.keycloak,
      onSetInstanceState: this.instanceSetStatePresenter.getSetInstanceStateHandler(
        instance.id
      ),
    });
  }
}
