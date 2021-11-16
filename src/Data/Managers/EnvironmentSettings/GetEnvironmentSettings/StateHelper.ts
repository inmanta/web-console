import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetEnvironmentSettingsStateHelper extends PrimaryStateHelper<"GetEnvironmentSettings"> {
  constructor(store: Store, private readonly environment: string) {
    super(
      store,
      (data) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.environmentSettings.setData({
          environment,
          value: unwrapped,
        });
      },
      (state) => state.environmentSettings.byEnv[environment]
    );
  }
}
