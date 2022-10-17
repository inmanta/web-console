import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function ServiceInstancesStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetServiceInstances">(
    store,
    (value, query, environment) => {
      store.dispatch.serviceInstances.setData({
        query,
        value,
        environment,
      });
    },
    (state, query, environment) =>
      state.serviceInstances.instancesWithTargetStates(query, environment)
  );
}
