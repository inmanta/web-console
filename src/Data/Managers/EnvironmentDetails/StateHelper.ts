import { Query, RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store, State, Dispatch } from "@/Data/Store";

export class EnvironmentDetailsStateHelper extends PrimaryStateHelper<"GetEnvironmentDetails"> {
  constructor(store: Store, private readonly environment: string) {
    super(
      store,
      (data, query) => {
        const unwrapped = RemoteData.mapSuccess(
          (wrapped) => wrapped.data,
          data
        );
        this.getSlice(store.dispatch, query).setData({
          id: this.environment,
          value: unwrapped,
        });
      },
      (state, query) => this.getSlice(state, query).byEnv[environment]
    );
  }

  private getSlice<T extends Dispatch | State>(
    root: T,
    { details }: Query.SubQuery<"GetEnvironmentDetails">
  ): T["environmentDetails" | "environmentDetailsWithIcon"] {
    return details ? root.environmentDetailsWithIcon : root.environmentDetails;
  }
}
