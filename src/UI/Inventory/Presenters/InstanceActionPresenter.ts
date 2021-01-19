import React from "react";
import { ActionPresenter, ServiceInstanceForAction } from "./ActionPresenter";
import { InstanceActions } from "UI/Inventory/InstanceActions";

export class InstanceActionPresenter implements ActionPresenter {
  constructor(private readonly instances: ServiceInstanceForAction[]) {}

  private getInstanceForId(id: string): ServiceInstanceForAction | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getForId(id: string): React.ReactElement | null {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") return null;
    return InstanceActions({ instance });
  }
}
