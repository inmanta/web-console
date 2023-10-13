import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function ServiceConfigStateHelper(store: Store) {
  return PrimaryStateHelper<"GetServiceConfig">(
    store,
    (data, query) => {
      const value = RemoteData.mapSuccess((data) => data.data, data);
      store.dispatch.serviceConfig.setData({
        name: query.name,
        value,
      });
    },
    (state, query) => state.serviceConfig.byName[query.name],
  );
}
