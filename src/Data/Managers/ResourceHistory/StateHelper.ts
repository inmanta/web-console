import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class ResourceHistoryStateHelper extends PrimaryStateHelper<"GetResourceHistory"> {
  constructor(store: Store) {
    super(
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
}
