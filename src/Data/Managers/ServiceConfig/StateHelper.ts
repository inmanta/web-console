import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"GetServiceConfig">,
  Query.Data<"GetServiceConfig">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetServiceConfig">,
  Query.ApiResponse<"GetServiceConfig">
>;

export class ServiceConfigStateHelper
  implements StateHelper<"GetServiceConfig">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"GetServiceConfig">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.serviceConfig.setData({
      name: query.name,
      value,
    });
  }

  getHooked(query: Query.SubQuery<"GetServiceConfig">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.serviceConfig.byName[query.name]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetServiceConfig">): Data {
    return this.enforce(this.store.getState().serviceConfig.byName[query.name]);
  }
}
