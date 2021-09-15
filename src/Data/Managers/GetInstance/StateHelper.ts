import { Query, RemoteData, StateHelper, ServiceInstanceModel } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, ServiceInstanceModel>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"ServiceInstance">>;

export class ServiceInstanceStateHelper
  implements StateHelper<"ServiceInstance">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"ServiceInstance">): void {
    const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.serviceInstance.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"ServiceInstance">): Data {
    return useStoreState((state) => {
      return this.enforce(state.serviceInstance.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"ServiceInstance">): Data {
    return this.enforce(this.store.getState().serviceInstance.byId[query.id]);
  }
}
