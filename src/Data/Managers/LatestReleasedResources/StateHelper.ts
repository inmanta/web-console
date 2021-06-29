import { Query, RemoteData, ResourceStatus, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<
  Query.Error<"LatestReleasedResources">,
  Query.Data<"LatestReleasedResources">
>;
type ApiData = RemoteData.Type<
  Query.Error<"LatestReleasedResources">,
  Query.ApiResponse<"LatestReleasedResources">
>;

export class LatestReleasedResourcesStateHelper
  implements StateHelper<"LatestReleasedResources">
{
  constructor(
    private readonly store: Store,
    private readonly environment: string
  ) {}

  set(data: ApiData): void {
    const unwrapped = RemoteData.mapSuccess(
      (wrapped) =>
        wrapped.data.map((resource) => ({
          ...resource,
          status: resource.status as ResourceStatus,
        })),
      data
    );
    this.store.dispatch.latestReleasedResources.setList({
      environment: this.environment,
      data: unwrapped,
    });
  }

  getHooked(): Data {
    return useStoreState(
      (state) =>
        this.enforce(state.latestReleasedResources.listByEnv[this.environment]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(): Data {
    return this.enforce(
      this.store.getState().latestReleasedResources.listByEnv[this.environment]
    );
  }
}
