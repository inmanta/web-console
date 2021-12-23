import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetEnvironmentSettingsStateHelper extends PrimaryStateHelperWithEnv<"GetEnvironmentSettings"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.environmentSettings.setData({
          environment,
          value: unwrapped,
        });
      },
      (state, query, environment) =>
        state.environmentSettings.byEnv[environment]
    );
  }
}
