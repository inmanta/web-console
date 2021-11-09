import { isEqual } from "lodash";
import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetServices">,
  Query.Data<"GetServices">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetServices">,
  Query.ApiResponse<"GetServices">
>;

export class ServicesStateHelper implements StateHelper<"GetServices"> {
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  set(data: ApiData): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.services.setList({
      environment: this.environment,
      data: unwrapped,
    });
  }

  getHooked(): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(state.services.listByEnv[this.environment]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(): Data {
    return this.enforce(
      this.store.getState().services.listByEnv[this.environment]
    );
  }
}
