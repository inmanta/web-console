import { Either, RemoteData } from "@/Core";
import { DataModel, StateHelper } from "./Interfaces";
import { Store, useStoreState } from "./Store";

export class StateHelperImpl implements StateHelper {
  constructor(private readonly store: Store) {}

  set(id: string, value: Either.Type<string, DataModel>): void {
    this.store.dispatch.setData({ id, value });
  }

  get(id: string): RemoteData.Type<string, DataModel> {
    return useStoreState((state) => {
      const value = state.data[id];
      if (typeof value === "undefined") return RemoteData.notAsked();
      return value;
    });
  }
}
