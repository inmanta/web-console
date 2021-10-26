import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"GetResourceLogs">,
  Query.Data<"GetResourceLogs">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetResourceLogs">,
  Query.ApiResponse<"GetResourceLogs">
>;

export class ResourceLogsStateHelper implements StateHelper<"GetResourceLogs"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, { id }: Query.SubQuery<"GetResourceLogs">): void {
    const value = RemoteData.mapSuccess((data) => data, data);
    this.store.dispatch.resourceLogs.setData({
      id,
      value,
    });
  }

  getHooked({ id }: Query.SubQuery<"GetResourceLogs">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(state.resourceLogs.byId[id]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.SubQuery<"GetResourceLogs">): Data {
    return this.enforce(this.store.getState().resourceLogs.byId[id]);
  }
}
