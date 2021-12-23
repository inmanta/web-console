import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class ResourceLogsStateHelper extends PrimaryStateHelper<"GetResourceLogs"> {
  constructor(store: Store) {
    super(
      store,
      (data, { id }) => {
        const value = RemoteData.mapSuccess((data) => data, data);
        store.dispatch.resourceLogs.setData({
          id,
          value,
        });
      },
      (state, { id }) => state.resourceLogs.byId[id]
    );
  }
}
