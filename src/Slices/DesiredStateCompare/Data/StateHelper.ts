import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetDesiredStateDiffStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetDesiredStateDiff">(
    store,
    (apiData, query, environment) => {
      const data = RemoteData.mapSuccess((response) => response.data, apiData);
      store.dispatch.desiredStateDiff.setList({ environment, data });
    },
    (state, query, environment) => state.desiredStateDiff.listByEnv[environment]
  );
}
