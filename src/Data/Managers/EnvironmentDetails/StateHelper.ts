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

  set(
    data: ApiData,
    { details }: Query.SubQuery<"GetEnvironmentDetails">
  ): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    if (details) {
      this.store.dispatch.environmentDetailsWithIcon.setData({
        id: this.environment,
        value: unwrapped,
      });
    } else {
      this.store.dispatch.environmentDetails.setData({
        id: this.environment,
        value: unwrapped,
      });
    }
  }

  getHooked({ details }: Query.SubQuery<"GetEnvironmentDetails">): Data {
    if (details) {
      /* eslint-disable-next-line react-hooks/rules-of-hooks */
      return useStoreState(
        (state) =>
          this.enforce(
            state.environmentDetailsWithIcon.byEnv[this.environment]
          ),
        isEqual
      );
    }
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

  getOnce({ details }: Query.SubQuery<"GetEnvironmentDetails">): Data {
    if (details) {
      return this.enforce(
        this.store.getState().environmentDetailsWithIcon.byEnv[this.environment]
      );
    }
    return this.enforce(
      this.store.getState().environmentDetails.byEnv[this.environment]
    );
  }
}
