import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class StateHelper extends PrimaryStateHelper<"GetVersionedResourceDetails"> {
  constructor(store: Store) {
    super(
      store,
      (data, query) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.versionedResourceDetails.setList({
          resourceId: query.id,
          data: unwrapped,
        });
      },
      (state, query) => state.versionedResourceDetails.listByResource[query.id]
    );
  }
}
