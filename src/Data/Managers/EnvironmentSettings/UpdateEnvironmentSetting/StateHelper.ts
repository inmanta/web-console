import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetEnvironmentSettingStateHelper extends PrimaryStateHelperWithEnv<"GetEnvironmentSetting"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.environment.setSettingsData({
          environment,
          value: unwrapped,
          merge: true,
        });
      },
      () => RemoteData.notAsked()
    );
  }
}
