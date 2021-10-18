import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"InstanceConfig">,
  Query.Data<"InstanceConfig">
>;
type ApiData = RemoteData.Type<
  Query.Error<"InstanceConfig">,
  Query.ApiResponse<"InstanceConfig">
>;

export class InstanceConfigStateHelper
  implements StateHelper<"InstanceConfig">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"InstanceConfig">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.instanceConfig.setData({
      id: query.id,
      value,
    });
  }

  getHooked(query: Query.SubQuery<"InstanceConfig">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.instanceConfig.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"InstanceConfig">): Data {
    return this.enforce(this.store.getState().instanceConfig.byId[query.id]);
  }
}
