import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function ServicesStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetServices">(
    store,
    (data, query, environment) => {
      const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
      store.dispatch.services.setList({
        environment,
        data: unwrapped,
      });
    },
    (state, query, environment) => state.services.listByEnv[environment],
  );
}
