import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data";
import { Store } from "@/Data/Store";

export class GetServerStatusStateHelper extends PrimaryStateHelper<"GetServerStatus"> {
  constructor(store: Store) {
    super(
      store,
      (data) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        if (!RemoteData.isLoading(unwrapped)) {
          store.dispatch.serverStatus.setData(unwrapped);
        }
      },
      (state) => state.serverStatus.status
    );
  }
}
