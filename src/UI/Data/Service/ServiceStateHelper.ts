import { KeyMaker, Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;

export class ServiceStateHelper implements StateHelper<"Service"> {
  constructor(
    private readonly store: Store,
    private readonly keyMaker: KeyMaker<Query.Qualifier<"Service">>
  ) {}

  set(qualifier: Query.Qualifier<"Service">, data: Data): void {
    this.store.dispatch.services.setSingle({ qualifier, data });
  }

  getHooked(qualifier: Query.Qualifier<"Service">): Data {
    return useStoreState((state) => {
      return this.enforce(
        state.services.byNameAndEnv[this.keyMaker.make(qualifier)]
      );
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(id: Query.Qualifier<"Service">): Data {
    return this.enforce(
      this.store.getState().services.byNameAndEnv[this.keyMaker.make(id)]
    );
  }
}
