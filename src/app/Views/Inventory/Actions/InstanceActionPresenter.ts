import React from "react";
import { Actions } from "./Actions";
import { ActionPresenter, Instance } from "./ActionPresenter";

export class InstanceActionPresenter implements ActionPresenter {
  constructor(private readonly instances: Instance[]) {}

  private getInstanceForId(id: string): Instance | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getForId(id: string): React.ReactElement | null {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") return null;
    return Actions({ instance });
  }
}
