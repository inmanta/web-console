import { RemoteData, Resource } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function ResourceDetailsStateHelper(store: Store) {
  return PrimaryStateHelper<"GetResourceDetails">(
    store,
    (data, query) => {
      const value = RemoteData.mapSuccess(
        (wrapped) => ({
          ...wrapped.data,
          status: wrapped.data.status as Resource.Status,
          requires_status: Object.fromEntries(
            Object.entries(wrapped.data.requires_status).map(([k, v]) => [
              k,
              v as Resource.Status,
            ]),
          ),
        }),
        data,
      );
      store.dispatch.resourceDetails.setData({ id: query.id, value });
    },
    (state, query) => state.resourceDetails.byId[query.id],
  );
}
