import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetVersionResourcesStateHelper extends PrimaryStateHelper<"GetVersionResources"> {
  constructor(store: Store, private readonly environment: string) {
    super(
      store,
      (data) => {
        store.dispatch.versionResources.set({
          environment: this.environment,
          data,
        });
      },
      (state) => state.versionResources.byEnv[this.environment]
    );
  }
}
