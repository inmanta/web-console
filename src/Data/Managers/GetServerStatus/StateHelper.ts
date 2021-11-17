import { RemoteData, ServerStatus } from "@/Core";
import { PrimaryStateHelper } from "@/Data";
import { Store } from "@/Data/Store";

export class GetServerStatusStateHelper extends PrimaryStateHelper<"GetServerStatus"> {
  constructor(store: Store) {
    super(
      store,
      (data) => {
        const currentStatus: RemoteData.Type<string, ServerStatus> =
          store.getState().serverStatus.status;
        const newStatus = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        if (
          RemoteData.isLoading(newStatus) &&
          !RemoteData.isNotAsked(currentStatus)
        ) {
          return;
        }
        store.dispatch.serverStatus.setData(newStatus);
      },
      (state) => state.serverStatus.status
    );
  }
}
