import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"GetInstanceLogs">,
  Query.Data<"GetInstanceLogs">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetInstanceLogs">,
  Query.ApiResponse<"GetInstanceLogs">
>;

export class InstanceLogsStateHelper implements StateHelper<"GetInstanceLogs"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"GetInstanceLogs">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.instanceLogs.setData({ id: query.id, value });
  }

  getHooked(query: Query.SubQuery<"GetInstanceLogs">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.instanceLogs.byId[query.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetInstanceLogs">): Data {
    return this.enforce(this.store.getState().instanceLogs.byId[query.id]);
  }
}
