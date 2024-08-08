import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function EventsStateHelper(store: Store) {
  return PrimaryStateHelper<"GetInstanceEvents">(
    store,
    (data, { id }) => {
      const value = RemoteData.mapSuccess((data) => data, data);
      store.dispatch.events.setData({ id, value });
    },
    (state, { id }) => state.events.byId[id],
  );
}
