import { KeyMaker, RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function ServiceStateHelper(
  store: Store,
  keyMaker: KeyMaker<[string, string]>
) {
  return PrimaryStateHelperWithEnv<"GetService">(
    store,
    (data, query, environment) => {
      const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
      store.dispatch.services.setSingle({
        query,
        data: unwrapped,
        environment,
      });
    },
    (state, query, environment) =>
      state.services.byNameAndEnv[keyMaker.make([environment, query.name])]
  );
}
