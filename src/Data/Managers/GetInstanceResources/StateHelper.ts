import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function InstanceResourcesStateHelper(store: Store) {
  return PrimaryStateHelper<"GetInstanceResources">(
    store,
    (data, query) => {
      const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
      store.dispatch.instanceResources.setData({ id: query.id, value });
    },
    (state, query) => state.instanceResources.byId[query.id],
  );
}
