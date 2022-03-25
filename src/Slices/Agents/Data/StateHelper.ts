import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetAgentsStateHelper extends PrimaryStateHelperWithEnv<"GetAgents"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const value = RemoteData.mapSuccess((wrapped) => wrapped, data);
        store.dispatch.agents.setList({
          environment,
          data: value,
        });
      },
      (state, query, environment) => state.agents.listByEnv[environment]
    );
  }
}
