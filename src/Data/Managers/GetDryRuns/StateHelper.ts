import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetDryRunsStateHelper extends PrimaryStateHelperWithEnv<"GetDryRuns"> {
  constructor(store: Store) {
    super(
      store,
      (apiData, { version }, environment) => {
        const data = RemoteData.mapSuccess(
          (response) => response.data,
          apiData
        );
        store.dispatch.dryRuns.setList({
          environment,
          version,
          data,
        });
      },
      (state, { version }, environment) => {
        console.log({ state: state.dryRuns });
        const slice = state.dryRuns.listByEnvAndVersion[environment];
        if (slice === undefined) return undefined;
        return slice[version];
      }
    );
  }
}
