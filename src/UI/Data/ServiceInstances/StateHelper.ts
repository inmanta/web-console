import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, Query.Data<"ServiceInstances">>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"ServiceInstances">>;

export class ServiceInstancesStateHelper
  implements StateHelper<"ServiceInstances">
{
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  /**
   * We could implement a performance improvement here by first checking
   * if the same data is already in the store. If the data is the same,
   * there is no need to trigger an action. But triggering the action
   * always is useful for debugging purposes. And the view is not
   * rerendered anyway because the getStoreState hook is also optimized
   * to check if the data is changed.
   */
  set(value: ApiData, qualifier: Query.Qualifier<"ServiceInstances">): void {
    this.store.dispatch.serviceInstances.setData({
      qualifier,
      value,
      environment: this.environment,
    });
  }

  getHooked(qualifier: Query.Qualifier<"ServiceInstances">): Data {
    return useStoreState((state) => {
      return this.enforce(
        state.serviceInstances.instancesWithTargetStates(
          qualifier,
          this.environment
        )
      );
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(qualifier: Query.Qualifier<"ServiceInstances">): Data {
    return this.enforce(
      this.store
        .getState()
        .serviceInstances.instancesWithTargetStates(qualifier, this.environment)
    );
  }
}
