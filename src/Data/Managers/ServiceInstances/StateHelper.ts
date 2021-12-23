import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class ServiceInstancesStateHelper extends PrimaryStateHelperWithEnv<"GetServiceInstances"> {
  constructor(store: Store) {
    super(
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
}
