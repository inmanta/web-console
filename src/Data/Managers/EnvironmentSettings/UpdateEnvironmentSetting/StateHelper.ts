import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetEnvironmentSettingStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetEnvironmentSetting">(
    store,
    (data, query, environment) => {
      const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
      store.dispatch.environment.setSettingsData({
        environment,
        value: unwrapped,
        merge: true,
      });
    },
    () => RemoteData.notAsked()
  );
}
