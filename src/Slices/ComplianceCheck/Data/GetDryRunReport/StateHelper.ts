import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function StateHelper(store: Store) {
  return PrimaryStateHelper<"GetDryRunReport">(
    store,
    (apiData, { reportId }) => {
      const data = RemoteData.mapSuccess((response) => response.data, apiData);
      store.dispatch.dryRunReport.set({
        reportId,
        data,
      });
    },
    (state, { reportId }) => state.dryRunReport.byId[reportId]
  );
}
