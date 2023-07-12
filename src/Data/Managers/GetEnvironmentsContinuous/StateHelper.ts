import { RemoteData, Query } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store, State, Dispatch } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironmentsContinuous">,
  Query.Data<"GetEnvironmentsContinuous">
>;

export function GetEnvironmentsContinuousStateHelper(store: Store) {
  function getData(
    state: State,
    { details }: Query.SubQuery<"GetEnvironmentsContinuous">
  ): Data {
    return details
      ? state.environment.environmentsWithDetails
      : state.environment.environments;
  }

  function setData(
    store: Dispatch,
    { details }: Query.SubQuery<"GetEnvironmentsContinuous">,
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
  return PrimaryStateHelper<"GetEnvironmentsContinuous">(
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
      setData(store.dispatch, query, unwrapped);
    },
    (state, query) => getData(state, query)
  );
}
