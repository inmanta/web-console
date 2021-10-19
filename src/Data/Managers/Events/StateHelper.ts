import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, Query.Data<"Events">>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"Events">>;

export class EventsStateHelper implements StateHelper<"Events"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, { id }: Query.SubQuery<"Events">): void {
    const value = RemoteData.mapSuccess((data) => data, data);
    this.store.dispatch.events.setData({ id, value });
  }

  getHooked({ id }: Query.SubQuery<"Events">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.events.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.SubQuery<"Events">): Data {
    return this.enforce(this.store.getState().events.byId[id]);
  }
}
