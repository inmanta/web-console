import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"InstanceLogs">,
  Query.Data<"InstanceLogs">
>;
type ApiData = RemoteData.Type<
  Query.Error<"InstanceLogs">,
  Query.ApiResponse<"InstanceLogs">
>;

export class InstanceLogsStateHelper implements StateHelper<"InstanceLogs"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"InstanceLogs">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.instanceLogs.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"InstanceLogs">): Data {
    return useStoreState((state) => {
      return this.enforce(state.instanceLogs.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"InstanceLogs">): Data {
    return this.enforce(this.store.getState().instanceLogs.byId[query.id]);
  }
}
