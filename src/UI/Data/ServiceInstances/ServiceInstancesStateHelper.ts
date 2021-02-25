import {
  RemoteData,
  ServiceInstanceModel,
  ServiceInstanceModelWithTargetStates,
  StateHelper,
} from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, ServiceInstanceModelWithTargetStates[]>;
type ApiData = RemoteData.Type<string, ServiceInstanceModel[]>;

export class ServiceInstancesStateHelper
  implements
    StateHelper<
      string,
      ServiceInstanceModelWithTargetStates[],
      ServiceInstanceModel[]
    > {
  constructor(private readonly store: Store) {}

  /**
   * We could implement a performance improvement here by first checking
   * if the same data is already in the store. If the data is the same,
   * there is no need to trigger an action. But triggering the action
   * always is useful for debugging purposes. And the view is not
   * rerendered anyway because the getStoreState hook is also optimized
   * to check if the data is changed.
   */
  set(id: string, value: ApiData): void {
    this.store.dispatch.serviceInstances.setData({ id, value });
  }

  getHooked(id: string): Data {
    return useStoreState((state) => {
      return this.enforce(state.serviceInstances.instancesWithTargetStates(id));
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(id: string): Data {
    return this.enforce(
      this.store.getState().serviceInstances.instancesWithTargetStates(id)
    );
  }
}
