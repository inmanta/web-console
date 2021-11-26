import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetFactsStateHelper extends PrimaryStateHelper<"GetFacts"> {
  constructor(store: Store) {
    super(
      store,
      (data, { resourceId }) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.facts.setList({ resourceId, data: unwrapped });
      },
      (state, { resourceId }) => state.facts.listByResource[resourceId]
    );
  }
}
