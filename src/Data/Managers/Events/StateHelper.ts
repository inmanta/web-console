import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class EventsStateHelper extends PrimaryStateHelper<"GetInstanceEvents"> {
  constructor(store: Store) {
    super(
      store,
      (data, { id }) => {
        const value = RemoteData.mapSuccess((data) => data, data);
        store.dispatch.events.setData({ id, value });
      },
      (state, { id }) => state.events.byId[id]
    );
  }
}
