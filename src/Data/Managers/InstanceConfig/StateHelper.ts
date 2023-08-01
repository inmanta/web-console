import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function InstanceConfigStateHelper(store: Store) {
  return PrimaryStateHelper<"GetInstanceConfig">(
    store,
    (data, query) => {
      const value = RemoteData.mapSuccess((data) => data.data, data);
      store.dispatch.instanceConfig.setData({
        id: query.id,
        value,
      });
    },
    (state, query) => state.instanceConfig.byId[query.id],
  );
}
