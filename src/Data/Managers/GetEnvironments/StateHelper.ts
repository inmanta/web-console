import { RemoteData, Query } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store, State, Dispatch } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironments">,
  Query.Data<"GetEnvironments">
>;

export class GetEnvironmentsStateHelper extends PrimaryStateHelper<"GetEnvironments"> {
  constructor(store: Store) {
    super(
      store,
      (data, query) => {
        const unwrapped = RemoteData.mapSuccess((wrapped) => {
          return wrapped.data.flatMap((project) => [
            ...project.environments.map((environment) => ({
              ...environment,
              projectName: project.name,
            })),
          ]);
        }, data);
        this.setData(store.dispatch, query, unwrapped);
      },
      (state, query) => this.getData(state, query)
    );
  }

  private getData(
    state: State,
    { details }: Query.SubQuery<"GetEnvironments">
  ): Data {
    return details
      ? state.environment.environmentsWithDetails
      : state.environment.environments;
  }

  private setData(
    store: Dispatch,
    { details }: Query.SubQuery<"GetEnvironments">,
    data: Data
  ) {
    if (details) {
      store.environment.setEnvironmentsWithDetails(data);
      if (RemoteData.isSuccess(data)) {
        store.environment.setEnvironments(data);
      }
    } else {
      store.environment.setEnvironments(data);
    }
  }
}
