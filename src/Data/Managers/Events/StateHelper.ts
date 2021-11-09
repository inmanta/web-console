import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<string, Query.Data<"GetInstanceEvents">>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"GetInstanceEvents">>;

export class EventsStateHelper implements StateHelper<"GetInstanceEvents"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, { id }: Query.SubQuery<"GetInstanceEvents">): void {
    const value = RemoteData.mapSuccess((data) => data, data);
    this.store.dispatch.events.setData({ id, value });
  }

  getHooked({ id }: Query.SubQuery<"GetInstanceEvents">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.events.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.SubQuery<"GetInstanceEvents">): Data {
    return this.enforce(this.store.getState().events.byId[id]);
  }
}
