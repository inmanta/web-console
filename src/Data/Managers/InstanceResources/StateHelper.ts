import { Query, RemoteData, InstanceResourceModel, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, InstanceResourceModel[]>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"InstanceResources">>;

export class InstanceResourcesStateHelper
  implements StateHelper<"InstanceResources">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"InstanceResources">): void {
    const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.instanceResources.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"InstanceResources">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.instanceResources.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"InstanceResources">): Data {
    return this.enforce(this.store.getState().instanceResources.byId[query.id]);
  }
}
