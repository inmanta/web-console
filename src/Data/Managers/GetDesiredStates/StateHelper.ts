import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetDesiredStatesStateHelper extends PrimaryStateHelper<"GetDesiredStates"> {
  constructor(store: Store, private readonly environment: string) {
    super(
      store,
      (data) => {
        const value = RemoteData.mapSuccess((wrapped) => wrapped, data);
        store.dispatch.desiredStates.setList({
          environment: this.environment,
          data: value,
        });
      },
      (state) => state.desiredStates.listByEnv[this.environment]
    );
  }
}
