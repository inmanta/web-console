import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function ResourceHistoryStateHelper(store: Store) {
  return PrimaryStateHelper<"GetResourceHistory">(
    store,
    (data, query) => {
      const value = RemoteData.mapSuccess((data) => data, data);
      store.dispatch.resourceHistory.setData({
        id: query.id,
        value,
      });
    },
    (state, query) => state.resourceHistory.byId[query.id]
  );
}
