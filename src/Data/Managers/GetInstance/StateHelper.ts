import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function ServiceInstanceStateHelper(store: Store) {
  return PrimaryStateHelper<"GetServiceInstance">(
    store,
    (data, query) => {
      const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
      store.dispatch.serviceInstance.setData({ id: query.id, value });
    },
    (state, query) => state.serviceInstance.byId[query.id],
  );
}
