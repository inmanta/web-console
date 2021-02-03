import {
  IServiceModel,
  ServiceInstanceModelWithTargetStates,
} from "@app/Models/LsmModels";
import { ReactElement } from "react";
import { InstanceState } from "../Components/InstanceState";
import { StatePresenter } from "./StatePresenter";

export class InstanceStatePresenter implements StatePresenter {
  constructor(
    private readonly instances: ServiceInstanceModelWithTargetStates[],
    private readonly serviceEntity: IServiceModel
  ) {}

  private getInstanceForId(
    id: string
  ): ServiceInstanceModelWithTargetStates | undefined {
    return this.instances.find((instance) => instance.id === id);
  }

  getForId(id: string): ReactElement | null {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") {
      return null;
    }
    // The service entity lifecycle contains all of the states an instance of that entity can reach
    const lifecycleState = this.serviceEntity.lifecycle.states.find(
      (state) => state.name === instance.state
    );
    if (!lifecycleState) {
      return null;
    }
    return InstanceState({
      name: lifecycleState.name,
      label: lifecycleState.label,
    });
  }
}
