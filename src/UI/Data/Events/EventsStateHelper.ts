import { InstanceEvent, Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, InstanceEvent[]>;

export class EventsStateHelper implements StateHelper<"Events"> {
  constructor(private readonly store: Store) {}

  set({ id }: Query.Qualifier<"Events">, value: Data): void {
    this.store.dispatch.events.setData({ id, value });
  }

  getHooked({ id }: Query.Qualifier<"Events">): Data {
    return useStoreState((state) => {
      return this.enforce(state.events.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.Qualifier<"Events">): Data {
    return this.enforce(this.store.getState().events.byId[id]);
  }
}
