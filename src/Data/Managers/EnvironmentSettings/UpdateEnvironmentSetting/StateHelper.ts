import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetEnvironmentSettingStateHelper extends PrimaryStateHelper<"GetEnvironmentSetting"> {
  constructor(store: Store, private readonly environment: string) {
    super(
      store,
      (data) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        store.dispatch.environmentSettings.setData({
          environment: this.environment,
          value: unwrapped,
          merge: true,
        });
      },
      () => RemoteData.notAsked()
    );
  }
}
