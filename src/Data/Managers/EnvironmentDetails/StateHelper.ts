import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"EnvironmentDetails">,
  Query.Data<"EnvironmentDetails">
>;
type ApiData = RemoteData.Type<
  Query.Error<"EnvironmentDetails">,
  Query.ApiResponse<"EnvironmentDetails">
>;

export class EnvironmentDetailsStateHelper
  implements StateHelper<"EnvironmentDetails">
{
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  set(data: ApiData): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.environmentDetails.setData({
      id: this.environment,
      value: unwrapped,
    });
  }

  getHooked(): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(state.environmentDetails.byEnv[this.environment]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(): Data {
    return this.enforce(
      this.store.getState().environmentDetails.byEnv[this.environment]
    );
  }
}
