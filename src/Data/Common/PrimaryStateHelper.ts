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

export class PrimaryStateHelper<Kind extends Query.Kind>
  implements StateHelper<Kind>
{
  constructor(
    private readonly store: Store,
    private readonly customSet: (
      data: ApiData<Kind>,
      query: Query.SubQuery<Kind>
    ) => void,
    private readonly customGet: (
      state: State<StoreModel>,
      query: Query.SubQuery<Kind>
    ) => Data<Kind>
  ) {}

  set(data: ApiData<Kind>, query: Query.SubQuery<Kind>): void {
    this.customSet(data, query);
  }

  getHooked(query: Query.SubQuery<Kind>): Data<Kind> {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(this.customGet(state, query)),
      isEqual
    );
  }

  private enforce(value: undefined | Data<Kind>): Data<Kind> {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<Kind>): Data<Kind> {
    return this.enforce(this.customGet(this.store.getState(), query));
  }
}

export class PrimaryStateHelperWithEnv<Kind extends Query.Kind>
  implements StateHelperWithEnv<Kind>
{
  constructor(
    private readonly store: Store,
    private readonly customSet: (
      data: ApiData<Kind>,
      query: Query.SubQuery<Kind>,
      environment: string
    ) => void,
    private readonly customGet: (
      state: State<StoreModel>,
      query: Query.SubQuery<Kind>,
      environment: string
    ) => Data<Kind> | undefined
  ) {}

  set(
    data: ApiData<Kind>,
    query: Query.SubQuery<Kind>,
    environment: string
  ): void {
    this.customSet(data, query, environment);
  }

  getHooked(query: Query.SubQuery<Kind>, environment: string): Data<Kind> {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(this.customGet(state, query, environment)),
      isEqual
    );
  }

  private enforce(value: undefined | Data<Kind>): Data<Kind> {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<Kind>, environment: string): Data<Kind> {
    return this.enforce(
      this.customGet(this.store.getState(), query, environment)
    );
  }
}
