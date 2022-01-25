import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetInstanceLogsStateHelper extends PrimaryStateHelper<"GetInstanceLogs"> {
  constructor(store: Store) {
    super(
      store,
      (data, query) => {
        const value = RemoteData.mapSuccess((data) => data.data, data);
        store.dispatch.instanceLogs.setData({ id: query.id, value });
      },
      (state, query) => state.instanceLogs.byId[query.id]
    );
  }
}
