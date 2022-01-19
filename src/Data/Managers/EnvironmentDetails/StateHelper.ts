import { Query, RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store, State, Dispatch } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironmentDetails">,
  Query.Data<"GetEnvironmentDetails">
>;

export class EnvironmentDetailsStateHelper extends PrimaryStateHelperWithEnv<"GetEnvironmentDetails"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        this.setData(store.dispatch, query, environment, unwrapped);
      },
      (state, query, environment) => this.getData(state, query, environment)
    );
  }

  private getData(
    state: State,
    { details }: Query.SubQuery<"GetEnvironmentDetails">,
    id: string
  ): Data {
    return details
      ? state.environment.environmentDetailsWithIconById[id]
      : state.environment.environmentDetailsById[id];
  }

  private setData(
    store: Dispatch,
    { details }: Query.SubQuery<"GetEnvironmentDetails">,
    environment: string,
    data: Data
  ) {
    if (details) {
      store.environment.setEnvironmentDetailsWithIconById({
        id: environment,
        value: data,
      });
      if (RemoteData.isSuccess(data)) {
        store.environment.setEnvironmentDetailsById({
          id: environment,
          value: data,
        });
      }
    } else {
      store.environment.setEnvironmentDetailsById({
        id: environment,
        value: data,
      });
    }
  }
}
