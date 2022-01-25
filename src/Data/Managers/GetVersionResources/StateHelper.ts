import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetVersionResourcesStateHelper extends PrimaryStateHelperWithEnv<"GetVersionResources"> {
  constructor(store: Store) {
    super(
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
}
