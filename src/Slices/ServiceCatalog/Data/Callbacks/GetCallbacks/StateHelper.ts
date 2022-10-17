import { sortBy } from "lodash-es";
import { Query, RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetCallbacks">,
  Query.Data<"GetCallbacks">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetCallbacks">,
  Query.ApiResponse<"GetCallbacks">
>;

export function CallbacksStateHelper(store: Store) {
  function sanitize(data: ApiData, service_entity: string): Data {
    if (!RemoteData.isSuccess(data)) return data;
    const allCallbacks = data.value.data;
    const serviceCallbacks = allCallbacks.filter(
      (cb) => cb.service_entity === service_entity
    );
    const sortedCallbacks = sortBy(serviceCallbacks, ["url"]);
    return RemoteData.success(sortedCallbacks);
  }

  return PrimaryStateHelperWithEnv<"GetCallbacks">(
    store,
    (data, { service_entity }, environment) => {
      store.dispatch.callbacks.setData({
        environment,
        service_entity,
        value: sanitize(data, service_entity),
      });
    },
    (state, { service_entity }, environment) =>
      state.callbacks.byEnv[environment]?.[service_entity]
  );
}
