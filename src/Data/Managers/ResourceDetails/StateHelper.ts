import { Query, RemoteData, StateHelper, ResourceStatus } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"ResourceDetails">,
  Query.Data<"ResourceDetails">
>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"ResourceDetails">>;

export class ResourceDetailsStateHelper
  implements StateHelper<"ResourceDetails">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"ResourceDetails">): void {
    const value = RemoteData.mapSuccess(
      (wrapped) => ({
        ...wrapped.data,
        status: wrapped.data.status as ResourceStatus,
        requires_status: Object.fromEntries(
          Object.entries(wrapped.data.requires_status).map(([k, v]) => [
            k,
            v as ResourceStatus,
          ])
        ),
      }),
      data
    );
    this.store.dispatch.resourceDetails.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"ResourceDetails">): Data {
    return useStoreState((state) => {
      return this.enforce(state.resourceDetails.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"ResourceDetails">): Data {
    return this.enforce(this.store.getState().resourceDetails.byId[query.id]);
  }
}
