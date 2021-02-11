import { isListEqual, RemoteData, ResourceModel, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";

type Data = RemoteData.Type<string, ResourceModel[]>;

export class StateHelperImpl implements StateHelper<string, ResourceModel[]> {
  constructor(private readonly store: Store) {}

  set(id: string, value: Data): void {
    this.store.dispatch.resources.setData({ id, value });
  }

  getViaHook(id: string): Data {
    return useStoreState(
      (state) => {
        return this.enforce(state.resources.byId[id]);
      },
      (prev, next) => {
        const result = RemoteData.dualFold<string, ResourceModel[], boolean>({
          notAsked: () => true,
          loading: () => true,
          failed: (a, b) => a === b,
          success: (a, b) => isListEqual(a, b),
          incompatible: () => false,
        })(prev, next);
        console.log("check", { result, prev, next });
        return result;
      }
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  get(id: string): Data {
    return this.enforce(this.store.getState().resources.byId[id]);
  }
}
