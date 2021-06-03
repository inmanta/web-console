import { Query, RemoteData, StateHelper, Diagnostics } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, Diagnostics>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"Diagnostics">>;

export class DiagnosticsStateHelper implements StateHelper<"Diagnostics"> {
  constructor(private readonly store: Store) {}

  set(data: ApiData, { id }: Query.SubQuery<"Diagnostics">): void {
    const value = RemoteData.mapSuccess((data) => {
      return {
        failures: data.data.failures,
        rejections: data.data.rejections.map((rejection) => {
          // The backend always returns maximum one error
          return {
            ...rejection,
            error:
              rejection.errors.length > 0 ? rejection.errors[0] : undefined,
          };
        }),
      };
    }, data);
    this.store.dispatch.diagnostics.setData({ id, value });
  }

  getHooked({ id }: Query.SubQuery<"Diagnostics">): Data {
    return useStoreState((state) => {
      return this.enforce(state.diagnostics.byServiceInstanceId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.SubQuery<"Diagnostics">): Data {
    return this.enforce(
      this.store.getState().diagnostics.byServiceInstanceId[id]
    );
  }
}
