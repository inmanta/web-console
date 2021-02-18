import { isListEqual, RemoteData, ResourceModel, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";

type Data = RemoteData.Type<string, ResourceModel[]>;

export class ResourcesStateHelper
  implements StateHelper<string, ResourceModel[]> {
  constructor(private readonly store: Store) {}

  set(id: string, value: Data): void {
    this.store.dispatch.resources.setData({ id, value });
  }

  getHooked(id: string): Data {
    return useStoreState(
      (state) => {
        return this.enforce(state.resources.byId[id]);
      },
      (prev, next) =>
        RemoteData.dualFold<string, ResourceModel[], boolean>({
          notAsked: () => true,
          loading: () => true,
          failed: (a, b) => a === b,
          success: (a, b) => isListEqual(a, b),
          incompatible: () => false,
        })(prev, next)
    );
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce(id: string): Data {
    return this.enforce(this.store.getState().resources.byId[id]);
  }
}
