import { RemoteData, Query } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store, State, Dispatch } from "@/Data/Store";

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
        this.getSlice(store.dispatch, query).setEnvironments(unwrapped);
      },
      (state, query) => this.getSlice(state, query).environments
    );
  }

  private getSlice<T extends Dispatch | State>(
    root: T,
    { details }: Query.SubQuery<"GetEnvironments">
  ): T["environments" | "environmentsWithDetails"] {
    return details ? root.environmentsWithDetails : root.environments;
  }
}
