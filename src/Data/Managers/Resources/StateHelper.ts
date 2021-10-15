import { Query, RemoteData, ResourceStatus, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<Query.Error<"Resources">, Query.Data<"Resources">>;
type ApiData = RemoteData.Type<
  Query.Error<"Resources">,
  Query.ApiResponse<"Resources">
>;

export class ResourcesStateHelper implements StateHelper<"Resources"> {
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  set(data: ApiData): void {
    const unwrapped = RemoteData.mapSuccess(
      (wrapped) => ({
        ...wrapped,
        data: wrapped.data.map((resource) => ({
          ...resource,
          status: resource.status as ResourceStatus,
        })),
      }),
      data
    );
    this.store.dispatch.resources.setList({
      environment: this.environment,
      data: unwrapped,
    });
  }

  getHooked(): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState(
      (state) => this.enforce(state.resources.listByEnv[this.environment]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(): Data {
    return this.enforce(
      this.store.getState().resources.listByEnv[this.environment]
    );
  }
}
