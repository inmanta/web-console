import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class StateHelper extends PrimaryStateHelper<"GetAgentProcess"> {
  constructor(store: Store) {
    super(
      store,
      (data, { id }) => {
        const value = RemoteData.mapSuccess((data) => data.data, data);
        store.dispatch.agentProcess.setData({ id, value });
      },
      (state, { id }) => state.agentProcess.byId[id]
    );
  }
}
