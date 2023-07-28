import { Query, RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store, State, Dispatch } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironmentDetails">,
  Query.Data<"GetEnvironmentDetails">
>;

export function StateHelper(store: Store) {
  function getData(
    state: State,
    { details, id }: Query.SubQuery<"GetEnvironmentDetails">,
  ): Data {
    return details
      ? state.environment.environmentDetailsWithIconById[id]
      : state.environment.environmentDetailsById[id];
  }

  function setData(
    store: Dispatch,
    { details, id }: Query.SubQuery<"GetEnvironmentDetails">,
    data: Data,
  ) {
    if (details) {
      store.environment.setEnvironmentDetailsWithIconById({
        id,
        value: data,
      });
      if (RemoteData.isSuccess(data)) {
        store.environment.setEnvironmentDetailsById({
          id,
          value: data,
        });
      }
    } else {
      store.environment.setEnvironmentDetailsById({
        id,
        value: data,
      });
    }
  }
  return PrimaryStateHelper<"GetEnvironmentDetails">(
    store,
    (data, query) => {
      const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
      setData(store.dispatch, query, unwrapped);
    },
    (state, query) => getData(state, query),
  );
}
