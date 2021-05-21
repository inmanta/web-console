import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
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

  set(data: ApiData, qualifier: Query.Qualifier<"InstanceConfig">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.instanceConfig.setData({ id: qualifier.id, value });
  }

  getHooked(qualifier: Query.Qualifier<"InstanceConfig">): Data {
    return useStoreState((state) => {
      return this.enforce(state.instanceConfig.byId[qualifier.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(qualifier: Query.Qualifier<"InstanceConfig">): Data {
    return this.enforce(
      this.store.getState().instanceConfig.byId[qualifier.id]
    );
  }
}
