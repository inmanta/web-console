import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual, sortBy } from "lodash";

type Data = RemoteData.Type<Query.Error<"Callbacks">, Query.Data<"Callbacks">>;
type ApiData = RemoteData.Type<
  Query.Error<"Callbacks">,
  Query.ApiResponse<"Callbacks">
>;

export class CallbacksStateHelper implements StateHelper<"Callbacks"> {
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  set(data: ApiData, { service_entity }: Query.SubQuery<"Callbacks">): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    const sorted = RemoteData.mapSuccess(
      (callbacks) => sortBy(callbacks, ["url"]),
      unwrapped
    );
    this.store.dispatch.callbacks.setData({
      environment: this.environment,
      service_entity,
      value: sorted,
    });
  }

  getHooked({ service_entity }: Query.SubQuery<"Callbacks">): Data {
    return useStoreState(
      (state) =>
        this.enforce(state.callbacks.byEnv[this.environment]?.[service_entity]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ service_entity }: Query.SubQuery<"Callbacks">): Data {
    return this.enforce(
      this.store.getState().callbacks.byEnv[this.environment]?.[service_entity]
    );
  }
}
