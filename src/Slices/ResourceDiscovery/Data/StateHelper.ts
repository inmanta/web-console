import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetDiscoveredResourcesStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetDiscoveredResources">(
    store,
    (data, query, environment) => {
      const value = RemoteData.mapSuccess((wrapped) => wrapped, data);
      store.dispatch.discoveredResources.setList({
        environment,
        data: value,
      });
    },
    (state, query, environment) =>
      state.discoveredResources.listByEnv[environment],
  );
}
