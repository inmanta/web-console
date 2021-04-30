import { Diagnostics, Query, RemoteData, StateHelper } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, Diagnostics>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"Diagnostics">>;

export class DiagnosticsStateHelper implements StateHelper<"Diagnostics"> {
  constructor(private readonly store: Store) {}

  set({ id }: Query.Qualifier<"Diagnostics">, data: ApiData): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.diagnostics.setData({ id, value });
  }

  getHooked({ id }: Query.Qualifier<"Diagnostics">): Data {
    return useStoreState((state) => {
      return this.enforce(state.diagnostics.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.Qualifier<"Diagnostics">): Data {
    return this.enforce(this.store.getState().diagnostics.byId[id]);
  }
}
