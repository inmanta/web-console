import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"GetServerStatus">,
  Query.Data<"GetServerStatus">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetServerStatus">,
  Query.ApiResponse<"GetServerStatus">
>;

export class GetServerStatusStateHelper
  implements StateHelper<"GetServerStatus">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.serverStatus.setData(unwrapped);
  }

  getHooked(): Data {
    return useStoreState(
      (state) => this.enforce(state.serverStatus.status),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(): Data {
    return this.enforce(this.store.getState().serverStatus.status);
  }
}
