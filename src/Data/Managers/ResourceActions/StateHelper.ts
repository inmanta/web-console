import { Query, RemoteData, StateHelper, resourceIdFromDetails } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"ResourceActions">,
  Query.Data<"ResourceActions">
>;
type ApiData = RemoteData.Type<
  Query.Error<"ResourceActions">,
  Query.ApiResponse<"ResourceActions">
>;

export class ResourceActionsStateHelper
  implements StateHelper<"ResourceActions">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"ResourceActions">): void {
    const value = RemoteData.mapSuccess((data) => data, data);
    this.store.dispatch.resourceActions.setData({
      id: resourceIdFromDetails(query),
      value,
    });
  }

  getHooked(query: Query.SubQuery<"ResourceActions">): Data {
    return useStoreState(
      (state) =>
        this.enforce(state.resourceActions.byId[resourceIdFromDetails(query)]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"ResourceActions">): Data {
    return this.enforce(
      this.store.getState().resourceActions.byId[resourceIdFromDetails(query)]
    );
  }
}
