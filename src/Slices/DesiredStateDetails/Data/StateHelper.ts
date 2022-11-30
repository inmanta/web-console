import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetVersionResourcesStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetVersionResources">(
    store,
    (data, query, environment) => {
      store.dispatch.versionResources.set({
        environment,
        data,
      });
    },
    (state, query, environment) => state.versionResources.byEnv[environment]
  );
}
