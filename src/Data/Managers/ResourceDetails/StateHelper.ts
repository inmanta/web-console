import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper, Resource } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetResourceDetails">,
  Query.Data<"GetResourceDetails">
>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"GetResourceDetails">>;

export class ResourceDetailsStateHelper
  implements StateHelper<"GetResourceDetails">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"GetResourceDetails">): void {
    const value = RemoteData.mapSuccess(
      (wrapped) => ({
        ...wrapped.data,
        status: wrapped.data.status as Resource.Status,
        requires_status: Object.fromEntries(
          Object.entries(wrapped.data.requires_status).map(([k, v]) => [
            k,
            v as Resource.Status,
          ])
        ),
      }),
      data
    );
    this.store.dispatch.resourceDetails.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"GetResourceDetails">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.resourceDetails.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetResourceDetails">): Data {
    return this.enforce(this.store.getState().resourceDetails.byId[query.id]);
  }
}
