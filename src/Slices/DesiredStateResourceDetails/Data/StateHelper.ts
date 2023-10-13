import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetDesiredStateResourceDetailsStateHelper(store: Store) {
  return PrimaryStateHelper<"GetVersionedResourceDetails">(
    store,
    (data, query) => {
      const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
      store.dispatch.versionedResourceDetails.setList({
        resourceId: query.id,
        data: unwrapped,
      });
    },
    (state, query) => state.versionedResourceDetails.listByResource[query.id],
  );
}
