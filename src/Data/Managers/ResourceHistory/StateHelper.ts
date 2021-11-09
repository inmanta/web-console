import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetResourceHistory">,
  Query.Data<"GetResourceHistory">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetResourceHistory">,
  Query.ApiResponse<"GetResourceHistory">
>;

export class ResourceHistoryStateHelper
  implements StateHelper<"GetResourceHistory">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"GetResourceHistory">): void {
    const value = RemoteData.mapSuccess((data) => data, data);
    this.store.dispatch.resourceHistory.setData({
      id: query.id,
      value,
    });
  }

  getHooked(query: Query.SubQuery<"GetResourceHistory">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(state.resourceHistory.byId[query.id]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetResourceHistory">): Data {
    return this.enforce(this.store.getState().resourceHistory.byId[query.id]);
  }
}
