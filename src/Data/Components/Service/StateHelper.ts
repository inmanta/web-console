import { KeyMaker, Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;
type ApiData = RemoteData.Type<
  Query.Error<"Service">,
  Query.ApiResponse<"Service">
>;

export class ServiceStateHelper implements StateHelper<"Service"> {
  constructor(
    private readonly store: Store,
    private readonly keyMaker: KeyMaker<[string, string]>,
    private readonly environment: string
  ) {}

  set(data: ApiData, query: Query.SubQuery<"Service">): void {
    const unwrapped = RemoteData.mapSuccess((wrapped) => wrapped.data, data);
    this.store.dispatch.services.setSingle({
      query,
      data: unwrapped,
      environment: this.environment,
    });
  }

  getHooked(query: Query.SubQuery<"Service">): Data {
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

  getOnce(query: Query.SubQuery<"Service">): Data {
    return this.enforce(
      this.store.getState().services.byNameAndEnv[
        this.keyMaker.make([this.environment, query.name])
      ]
    );
  }
}
