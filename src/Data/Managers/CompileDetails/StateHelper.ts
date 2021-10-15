import { Query, RemoteData, StateHelper, CompileDetails } from "@/Core";
import { Store, useStoreState } from "@/Data/Store";
import { isEqual } from "lodash";

type Data = RemoteData.Type<string, CompileDetails>;
type ApiData = RemoteData.Type<string, Query.ApiResponse<"CompileDetails">>;

export class CompileDetailsStateHelper
  implements StateHelper<"CompileDetails">
{
  constructor(private readonly store: Store) {}

  set(data: ApiData, { id }: Query.SubQuery<"CompileDetails">): void {
    const value = RemoteData.mapSuccess((data) => data.data, data);
    this.store.dispatch.compileDetails.setData({ id, value });
  }

  getHooked({ id }: Query.SubQuery<"CompileDetails">): Data {
    /* eslint-disable-next-line react-hooks/rules-of-hooks */
    return useStoreState((state) => {
      return this.enforce(state.compileDetails.byId[id]);
    }, isEqual);
  }

  private enforce(value: undefined | Data): Data {
    if (typeof value === "undefined") return RemoteData.notAsked();
    return value;
  }

  getOnce({ id }: Query.SubQuery<"CompileDetails">): Data {
    return this.enforce(this.store.getState().compileDetails.byId[id]);
  }
}
