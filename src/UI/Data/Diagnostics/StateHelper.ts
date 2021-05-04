import { Query, RemoteData, StateHelper, Diagnostics } from "@/Core";
import { Store, useStoreState } from "@/UI/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, Diagnostics>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"Diagnostics">>;

export class DiagnosticsStateHelper implements StateHelper<"Diagnostics"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, { id }: Query.Qualifier<"Diagnostics">): void {
    const value = RemoteData.mapSuccess((data) => {
      return {
        failures: data.data.failures,
        rejections: data.data.rejections.map((rejection) => {
          // The backend always returns only one error
          return { ...rejection, error: rejection.errors[0] };
        }),
      };
    }, data);
    this.store.dispatch.diagnostics.setData({ id, value });
  }

  getHooked({ id }: Query.Qualifier<"Diagnostics">): Data {
    return useStoreState((state) => {
      return this.enforce(state.diagnostics.byServiceInstanceId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.Qualifier<"Diagnostics">): Data {
    return this.enforce(
      this.store.getState().diagnostics.byServiceInstanceId[id]
    );
  }
}
