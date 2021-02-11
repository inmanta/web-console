import { RemoteData, StateHelper } from "@/Core";
import { DataModel, isEqual } from "./DataModel";
import { Store, useStoreState } from "./Store";

export class StateHelperImpl implements StateHelper<string, DataModel> {
  constructor(private readonly store: Store) {}
  getViaHook(id: string): RemoteData.Type<string, DataModel> {
    return useStoreState(
      (state) => {
        return this.enforce(state.data[id]);
      },
      (prev, next) =>
        RemoteData.dualFold<string, DataModel, boolean>({
          notAsked: () => true,
          loading: () => true,
          failed: (a, b) => a === b,
          success: (a, b) => isEqual(a, b),
          incompatible: () => false,
        })(prev, next)
    );
  }

  set(id: string, value: RemoteData.Type<string, DataModel>): void {
    this.store.dispatch.setData({ id, value });
  }

  get(id: string): RemoteData.Type<string, DataModel> {
    return this.enforce(this.store.getState().data[id]);
  }

  private enforce(
    value: undefined | RemoteData.Type<string, DataModel>
  ): RemoteData.Type<string, DataModel> {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }
}
