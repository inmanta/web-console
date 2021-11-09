import { isEqual, sortBy } from "lodash";
import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetCallbacks">,
  Query.Data<"GetCallbacks">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetCallbacks">,
  Query.ApiResponse<"GetCallbacks">
>;

export class CallbacksStateHelper implements StateHelper<"GetCallbacks"> {
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  private sanitize(data: ApiData, service_entity: string): Data {
    if (!RemoteData.isSuccess(data)) return data;
    const allCallbacks = data.value.data;
    const serviceCallbacks = allCallbacks.filter(
      (cb) => cb.service_entity === service_entity
    );
    const sortedCallbacks = sortBy(serviceCallbacks, ["url"]);
    return RemoteData.success(sortedCallbacks);
  }

  set(data: ApiData, { service_entity }: Query.SubQuery<"GetCallbacks">): void {
    this.store.dispatch.callbacks.setData({
      environment: this.environment,
      service_entity,
      value: this.sanitize(data, service_entity),
    });
  }

  getHooked({ service_entity }: Query.SubQuery<"GetCallbacks">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
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

  getOnce({ service_entity }: Query.SubQuery<"GetCallbacks">): Data {
    return this.enforce(
      this.store.getState().callbacks.byEnv[this.environment]?.[service_entity]
    );
  }
}
