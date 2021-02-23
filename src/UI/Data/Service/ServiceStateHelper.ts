import { Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<Query.Error<"Service">, Query.Data<"Service">>;

export class ServiceStateHelper
  implements StateHelper<Query.Error<"Service">, Query.Data<"Service">> {
  constructor(private readonly store: Store) {}

  set(id: string, value: Data): void {
    this.store.dispatch.services2.setData({ id, value });
  }

  getHooked(id: string): Data {
    return useStoreState((state) => {
      return this.enforce(state.services2.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(id: string): Data {
    return this.enforce(this.store.getState().services2.byId[id]);
  }
}
