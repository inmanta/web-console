import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetEnvironmentDetails">,
  Query.Data<"GetEnvironmentDetails">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetEnvironmentDetails">,
  Query.ApiResponse<"GetEnvironmentDetails">
>;

export class EnvironmentDetailsStateHelper
  implements StateHelper<"GetEnvironmentDetails">
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
