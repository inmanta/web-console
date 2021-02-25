import { KeyMaker, Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<Query.Error<"Services">, Query.Data<"Services">>;

export class ServicesStateHelper implements StateHelper<"Services"> {
  constructor(
    private readonly store: Store,
    private readonly keyMaker: KeyMaker<Query.Qualifier<"Service">>
  ) {}

  set(qualifier: Query.Qualifier<"Services">, data: Data): void {
    this.store.dispatch.services2.setList({ qualifier, data });
  }

  getHooked({ id: environment }: Query.Qualifier<"Services">): Data {
    return useStoreState(
      (state) => this.enforce(state.services2.listByEnv[environment]),
      isEqual
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id: environment }: Query.Qualifier<"Services">): Data {
    return this.enforce(this.store.getState().services2.listByEnv[environment]);
  }
}
