import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetResourceFactsStateHelper extends PrimaryStateHelper<"GetResourceFacts"> {
  constructor(store: Store) {
    super(
      store,
      (data, { resourceId }) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.resourceFacts.setList({
          resourceId,
          data: unwrapped,
        });
      },
      (state, { resourceId }) => state.resourceFacts.listByResource[resourceId]
    );
  }
}
