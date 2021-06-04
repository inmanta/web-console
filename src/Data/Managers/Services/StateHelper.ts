import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<Query.Error<"Services">, Query.Data<"Services">>;
type ApiData = RemoteData.Type<
  Query.Error<"Services">,
  Query.ApiResponse<"Services">
>;

export class ServicesStateHelper implements StateHelper<"Services"> {
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
