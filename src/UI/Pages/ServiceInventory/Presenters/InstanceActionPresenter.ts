import { ReactElement } from "react";
import { KeycloakInstance } from "keycloak-js";
import { InstanceActions } from "@/UI/Pages/ServiceInventory/Components";
import { ActionPresenter, ServiceInstanceForAction } from "./ActionPresenter";
import { InstanceSetStateManager } from "@/UI/Pages/ServiceInventory/InstanceSetStateManager";
import { ServiceModel } from "@/Core";

export class InstanceActionPresenter implements ActionPresenter {
  constructor(
    private readonly instances: ServiceInstanceForAction[],
    private readonly keycloak: KeycloakInstance | undefined,
    private readonly instanceSetStateManager: InstanceSetStateManager,
    private readonly serviceEntity: ServiceModel
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
      editDisabled: this.isTransferDisabled(id, "on_update"),
      deleteDisabled: this.isTransferDisabled(id, "on_delete"),
      diagnoseDisabled: instance.deleted,
      onSetInstanceState:
        this.instanceSetStateManager.getSetInstanceStateHandler(instance.id),
    });
  }

  isTransferDisabled(
    id: string,
    transferType: "on_update" | "on_delete"
  ): boolean {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") {
      return false;
    }
    // If the action is allowed, there is a corresponding transfer in the lifecycle,
    // where the source state is the current state
    const transfersFromCurrentSource =
      this.serviceEntity.lifecycle.transfers.filter(
        (transfer) =>
          transfer.source === instance.state && transfer[transferType]
      );
    return transfersFromCurrentSource.length === 0;
  }
}
