import { isEqual } from "lodash";
import { KeyMaker, Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";

type Data = RemoteData.Type<
  Query.Error<"GetService">,
  Query.Data<"GetService">
>;
type ApiData = RemoteData.Type<
  Query.Error<"GetService">,
  Query.ApiResponse<"GetService">
>;

export class ServiceStateHelper implements StateHelper<"GetService"> {
  constructor(
    private readonly store: Store,
    private readonly keyMaker: KeyMaker<[string, string]>,
    private readonly environment: string
  ) {}

  set(data: ApiData, query: Query.SubQuery<"GetService">): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.services.setSingle({
      query,
      data: unwrapped,
      environment: this.environment,
    });
  }

  getHooked(query: Query.SubQuery<"GetService">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(
        state.services.byNameAndEnv[
          this.keyMaker.make([this.environment, query.name])
        ]
      );
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(query: Query.SubQuery<"GetService">): Data {
    return this.enforce(
      this.store.getState().services.byNameAndEnv[
        this.keyMaker.make([this.environment, query.name])
      ]
    );
  }
}
