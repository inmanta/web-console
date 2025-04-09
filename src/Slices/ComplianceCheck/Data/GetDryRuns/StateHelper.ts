import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function StateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetDryRuns">(
    store,
    (apiData, { version }, environment) => {
      const data = RemoteData.mapSuccess((response) => response.data, apiData);

      store.dispatch.dryRuns.setList({
        environment,
        version,
        data,
      });
    },
    (state, { version }, environment) => {
      const slice = state.dryRuns.listByEnvAndVersion[environment];

      if (slice === undefined) return undefined;

      return slice[version];
    }
  );
}
