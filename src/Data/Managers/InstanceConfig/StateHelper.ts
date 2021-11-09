import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetInstanceConfig">,
  Query.Data<"GetInstanceConfig">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetInstanceConfig">,
  Query.ApiResponse<"GetInstanceConfig">
>;

export class InstanceConfigStateHelper
  implements StateHelper<"GetInstanceConfig">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"GetInstanceConfig">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.instanceConfig.setData({
      id: query.id,
      value,
    });
  }

  getHooked(query: Query.SubQuery<"GetInstanceConfig">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.instanceConfig.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetInstanceConfig">): Data {
    return this.enforce(this.store.getState().instanceConfig.byId[query.id]);
  }
}
