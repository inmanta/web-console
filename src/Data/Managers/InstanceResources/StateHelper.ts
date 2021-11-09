import { isEqual } from "lodash";
import { Query, RemoteData, InstanceResourceModel, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<string, InstanceResourceModel[]>;
type ApiData = RemoteData.Type<
  string,
  Query.ApiResponse<"GetInstanceResources">
>;

export class InstanceResourcesStateHelper
  implements StateHelper<"GetInstanceResources">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"GetInstanceResources">): void {
    const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.instanceResources.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"GetInstanceResources">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.instanceResources.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetInstanceResources">): Data {
    return this.enforce(this.store.getState().instanceResources.byId[query.id]);
  }
}
