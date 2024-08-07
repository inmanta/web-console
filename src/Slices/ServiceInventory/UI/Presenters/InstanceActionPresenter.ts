import React, { ReactElement } from "react";
import { ServiceModel } from "@/Core";
import { ActionPresenter, ServiceInstanceForAction } from "@/UI/Presenters";
import { RowActions } from "../Components/RowActionsMenu/RowActions";

export class InstanceActionPresenter implements ActionPresenter {
  constructor(
    private readonly instances: ServiceInstanceForAction[],
    private readonly serviceEntity: ServiceModel,
  ) {}

  private getInstanceForId(id: string): ServiceInstanceForAction | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getForId(id: string): ReactElement | null {
    const instance = this.getInstanceForId(id);

    if (typeof instance === "undefined") return null;

    return React.createElement(RowActions, {
      instance,
      editDisabled: this.isTransferDisabled(id, "on_update"),
      deleteDisabled: this.isTransferDisabled(id, "on_delete"),
      diagnoseDisabled: instance.deleted,
      composerAvailable: this.serviceEntity.owner === null,
      availableStates: this.getAvailableStates(),
    });
  }

  getAvailableStates(): string[] {
    return this.serviceEntity.lifecycle.states.map((state) => state.name);
  }

  isTransferDisabled(
    id: string,
    transferType: "on_update" | "on_delete",
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
          transfer.source === instance.state && transfer[transferType],
      );

    return transfersFromCurrentSource.length === 0;
  }
}
