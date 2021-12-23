import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class ServiceInstanceStateHelper extends PrimaryStateHelper<"GetServiceInstance"> {
  constructor(store: Store) {
    super(
      store,
      (data, query) => {
        const value = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
        store.dispatch.serviceInstance.setData({ id: query.id, value });
      },
      (state, query) => state.serviceInstance.byId[query.id]
    );
  }
}
