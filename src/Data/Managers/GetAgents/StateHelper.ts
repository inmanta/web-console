import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetAgentsStateHelper extends PrimaryStateHelper<"GetAgents"> {
  constructor(store: Store, private readonly environment: string) {
    super(
      store,
      (data) => {
        const value = RemoteData.mapSuccess((wrapped) => wrapped, data);
        store.dispatch.agents.setList({
          environment: this.environment,
          data: value,
        });
      },
      (state) => state.agents.listByEnv[this.environment]
    );
  }
}
