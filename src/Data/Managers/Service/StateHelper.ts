import { KeyMaker, RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data";
import { Store } from "@/Data/Store";

export class ServiceStateHelper extends PrimaryStateHelperWithEnv<"GetService"> {
  constructor(
    store: Store,
    private readonly keyMaker: KeyMaker<[string, string]>
  ) {
    super(
      store,
      (data, query, environment) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.services.setSingle({
          query,
          data: unwrapped,
          environment,
        });
      },
      (state, query, environment) =>
        state.services.byNameAndEnv[
          this.keyMaker.make([environment, query.name])
        ]
    );
  }
}
