import React from "react";
import { ActionPresenter, Instance } from "./ActionPresenter";
import { InstanceActions } from "UserInterface/Inventory/InstanceActions";

export class InstanceActionPresenter implements ActionPresenter {
  constructor(private readonly instances: Instance[]) {}

  private getInstanceForId(id: string): Instance | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getForId(id: string): React.ReactElement | null {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") return null;
    return InstanceActions({ instance });
  }
}
