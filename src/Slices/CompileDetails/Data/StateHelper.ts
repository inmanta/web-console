import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function StateHelper(store: Store) {
  return PrimaryStateHelper<"GetCompileDetails">(
    store,
    (data, { id }) => {
      const value = RemoteData.mapSuccess((data) => data.data, data);
      store.dispatch.compileDetails.setData({ id, value });
    },
    (state, { id }) => state.compileDetails.byId[id],
  );
}
