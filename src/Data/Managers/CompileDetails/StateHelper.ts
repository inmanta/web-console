import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class CompileDetailsStateHelper extends PrimaryStateHelper<"GetCompileDetails"> {
  constructor(store: Store) {
    super(
      store,
      (data, { id }) => {
        const value = RemoteData.mapSuccess((data) => data.data, data);
        store.dispatch.compileDetails.setData({ id, value });
      },
      (state, { id }) => state.compileDetails.byId[id]
    );
  }
}
