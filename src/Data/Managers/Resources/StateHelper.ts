import { isEqual } from "lodash";
import { Query, RemoteData, Resource, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetResources">,
  Query.Data<"GetResources">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetResources">,
  Query.ApiResponse<"GetResources">
>;

export class ResourcesStateHelper implements StateHelper<"GetResources"> {
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
          status: resource.status as Resource.Status,
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
