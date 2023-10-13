import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetMetricsStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetMetrics">(
    store,
    (data, query, environment) => {
      store.dispatch.environment.setEnvironmentMetricsById({
        id: environment,
        value: RemoteData.mapSuccess((wrapped) => wrapped.data, data),
      });
    },
    (state, query, environment) =>
      state.environment.environmentMetricsById[environment],
  );
}
