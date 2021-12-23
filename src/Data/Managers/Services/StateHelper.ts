import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class ServicesStateHelper extends PrimaryStateHelperWithEnv<"GetServices"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.services.setList({
          environment,
          data: unwrapped,
        });
      },
      (state, query, environment) => state.services.listByEnv[environment]
    );
  }
}
