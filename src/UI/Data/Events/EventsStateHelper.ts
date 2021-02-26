import { InstanceEvent, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, InstanceEvent[]>;

export class EventsStateHelper implements StateHelper<string, InstanceEvent[]> {
  constructor(private readonly store: Store) {}

  set(id: string, value: Data): void {
    this.store.dispatch.events.setData({ id, value });
  }

  getHooked(id: string): Data {
    return useStoreState((state) => {
      return this.enforce(state.events.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(id: string): Data {
    return this.enforce(this.store.getState().events.byId[id]);
  }
}
