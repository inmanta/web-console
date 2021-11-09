import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper, ServiceInstanceModel } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<string, ServiceInstanceModel>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"GetServiceInstance">>;

export class ServiceInstanceStateHelper
  implements StateHelper<"GetServiceInstance">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"GetServiceInstance">): void {
    const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.serviceInstance.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"GetServiceInstance">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.serviceInstance.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetServiceInstance">): Data {
    return this.enforce(this.store.getState().serviceInstance.byId[query.id]);
  }
}
