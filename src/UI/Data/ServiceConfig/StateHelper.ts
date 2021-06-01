import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"ServiceConfig">,
  Query.Data<"ServiceConfig">
>;
type ApiData = RemoteData.Type<
  Query.Error<"ServiceConfig">,
  Query.ApiResponse<"ServiceConfig">
>;

export class ServiceConfigStateHelper implements StateHelper<"ServiceConfig"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, query: Query.SubQuery<"ServiceConfig">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.serviceConfig.setData({
      name: query.name,
      value,
    });
  }

  getHooked(query: Query.SubQuery<"ServiceConfig">): Data {
    return useStoreState((state) => {
      return this.enforce(state.serviceConfig.byName[query.name]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"ServiceConfig">): Data {
    return this.enforce(this.store.getState().serviceConfig.byName[query.name]);
  }
}
