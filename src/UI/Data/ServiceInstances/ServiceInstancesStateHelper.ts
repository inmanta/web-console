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

  set(id: string, value: ApiData): void {
    this.store.dispatch.serviceInstances2.setData({ id, value });
  }

  getHooked(id: string): Data {
    return useStoreState((state) => {
      return this.enforce(
        state.serviceInstances2.instancesWithTargetStates(id)
      );
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(id: string): Data {
    return this.enforce(
      this.store.getState().serviceInstances2.instancesWithTargetStates(id)
    );
  }
}
