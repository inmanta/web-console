import { State } from "easy-peasy";
import { isEqual } from "lodash-es";
import { Query, RemoteData, StateHelper, StateHelperWithEnv } from "@/Core";
import { Store, StoreModel, useStoreState } from "@/Data/Store";

type Data<Kind extends Query.Kind> = RemoteData.Type<
  Query.Error<Kind>,
  Query.Data<Kind>
>;
type ApiData<Kind extends Query.Kind> = RemoteData.Type<
  Query.Error<Kind>,
  Query.ApiResponse<Kind>
>;

export function PrimaryStateHelper<Kind extends Query.Kind>(
  store: Store,
  customSet: (data: ApiData<Kind>, query: Query.SubQuery<Kind>) => void,
  customGet: (
    state: State<StoreModel>,
    query: Query.SubQuery<Kind>
  ) => Data<Kind>
): StateHelper<Kind> {
  function set(data: ApiData<Kind>, query: Query.SubQuery<Kind>): void {
    customSet(data, query);
  }

  function useGetHooked(query: Query.SubQuery<Kind>): Data<Kind> {
    return useStoreState((state) => enforce(customGet(state, query)), isEqual);
  }

  function enforce(value: undefined | Data<Kind>): Data<Kind> {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  function getOnce(query: Query.SubQuery<Kind>): Data<Kind> {
    return enforce(customGet(store.getState(), query));
  }
  return {
    set,
    useGetHooked,
    getOnce,
  };
}

export function PrimaryStateHelperWithEnv<Kind extends Query.Kind>(
  store: Store,
  customSet: (
    data: ApiData<Kind>,
    query: Query.SubQuery<Kind>,
    environment: string
  ) => void,
  customGet: (
    state: State<StoreModel>,
    query: Query.SubQuery<Kind>,
    environment: string
  ) => Data<Kind> | undefined
): StateHelperWithEnv<Kind> {
  function set(
    data: ApiData<Kind>,
    query: Query.SubQuery<Kind>,
    environment: string
  ): void {
    customSet(data, query, environment);
  }

  function useGetHooked(
    query: Query.SubQuery<Kind>,
    environment: string
  ): Data<Kind> {
    return useStoreState(
      (state) => enforce(customGet(state, query, environment)),
      isEqual
    );
  }

  function enforce(value: undefined | Data<Kind>): Data<Kind> {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  function getOnce(
    query: Query.SubQuery<Kind>,
    environment: string
  ): Data<Kind> {
    return enforce(customGet(store.getState(), query, environment));
  }
  return {
    useGetHooked,
    getOnce,
    set,
  };
}
