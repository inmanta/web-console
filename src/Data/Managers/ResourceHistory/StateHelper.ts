import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"ResourceHistory">,
  Query.Data<"ResourceHistory">
>;
type ApiData = RemoteData.Type<
  Query.Error<"ResourceHistory">,
  Query.ApiResponse<"ResourceHistory">
>;

export class ResourceHistoryStateHelper
  implements StateHelper<"ResourceHistory">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"ResourceHistory">): void {
    const value = RemoteData.mapSuccess((data) => data, data);
    this.store.dispatch.resourceHistory.setData({
      id: query.id,
      value,
    });
  }

  getHooked(query: Query.SubQuery<"ResourceHistory">): Data {
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

  getOnce(query: Query.SubQuery<"ResourceHistory">): Data {
    return this.enforce(this.store.getState().resourceHistory.byId[query.id]);
  }
}
