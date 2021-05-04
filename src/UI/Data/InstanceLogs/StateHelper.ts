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

  set(data: ApiData, qualifier: Query.Qualifier<"InstanceLogs">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.instanceLogs.setData({ id: qualifier.id, value });
  }

  getHooked(qualifier: Query.Qualifier<"InstanceLogs">): Data {
    return useStoreState((state) => {
      return this.enforce(state.instanceLogs.byId[qualifier.id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(qualifier: Query.Qualifier<"InstanceLogs">): Data {
    return this.enforce(this.store.getState().instanceLogs.byId[qualifier.id]);
  }
}
