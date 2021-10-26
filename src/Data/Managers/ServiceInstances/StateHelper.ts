import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, Query.Data<"GetServiceInstances">>;
type ApiData = RemoteData.Type<
  string,
  Query.ApiResponse<"GetServiceInstances">
>;

export class ServiceInstancesStateHelper
  implements StateHelper<"GetServiceInstances">
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
  set(value: ApiData, query: Query.SubQuery<"GetServiceInstances">): void {
    this.store.dispatch.serviceInstances.setData({
      query,
      value,
      environment: this.environment,
    });
  }

  getHooked(query: Query.SubQuery<"GetServiceInstances">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(
        state.serviceInstances.instancesWithTargetStates(
          query,
          this.environment
        )
      );
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetServiceInstances">): Data {
    return this.enforce(
      this.store
        .getState()
        .serviceInstances.instancesWithTargetStates(query, this.environment)
    );
  }
}
