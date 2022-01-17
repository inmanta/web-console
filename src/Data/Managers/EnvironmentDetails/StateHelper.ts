import { Query, RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store, State, Dispatch } from "@/Data/Store";

export class EnvironmentDetailsStateHelper extends PrimaryStateHelperWithEnv<"GetEnvironmentDetails"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        this.getSlice(store.dispatch, query).setData({
          id: environment,
          value: unwrapped,
        });
      },
      (state, query, environment) =>
        this.getSlice(state, query).byEnv[environment]
    );
  }

  private getSlice<T extends Dispatch | State>(
    root: T,
    { details }: Query.SubQuery<"GetEnvironmentDetails">
  ): T["environmentDetails" | "environmentDetailsWithIcon"] {
    return details ? root.environmentDetailsWithIcon : root.environmentDetails;
  }
}
