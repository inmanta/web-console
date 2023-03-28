import React, { ReactElement } from "react";
import { ServiceModel } from "@/Core";
import { ActionPresenter, ServiceInstanceForAction } from "@/UI/Presenters";
import { ExpertActions } from "../Components/ExpertActions";

/**
 * ActionPresenters holds logic that creates React Snippets realted  to specific Actions, in this case list of Expert Actions
 */
export class InstanceExpertActionPresenter implements ActionPresenter {
  constructor(
    private readonly instances: ServiceInstanceForAction[],
    private readonly serviceEntity: ServiceModel
  ) {}

  private getInstanceForId(id: string): ServiceInstanceForAction | undefined {
    return this.instances.find((instance) => instance.id === id);
  }
  /**
   * find instance according to given Id, if found an instance create React Component that holds Expert Actions regarding given instance
   * @param id
   * @returns React Component or null
   */
  getForId(id: string): ReactElement | null {
    const instance = this.getInstanceForId(id);
    if (typeof instance === "undefined") return null;
    const states = this.serviceEntity.lifecycle.states.map(
      (state) => state.name
    );
    return React.createElement(ExpertActions, {
      instance,
      targets: states,
    });
  }
}
