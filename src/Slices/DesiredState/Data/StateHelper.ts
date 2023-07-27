import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetDesiredStatesStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetDesiredStates">(
    store,
    (data, query, environment) => {
      const value = RemoteData.mapSuccess((wrapped) => wrapped, data);
      store.dispatch.desiredStates.setList({
        environment,
        data: value,
      });
    },
    (state, query, environment) => state.desiredStates.listByEnv[environment],
  );
}
