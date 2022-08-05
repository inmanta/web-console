import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetDesiredStateDiffStateHelper extends PrimaryStateHelperWithEnv<"GetDesiredStateDiff"> {
  constructor(store: Store) {
    super(
      store,
      (apiData, query, environment) => {
        const data = RemoteData.mapSuccess(
          (response) => response.data,
          apiData
        );
        store.dispatch.desiredStateDiff.setList({ environment, data });
      },
      (state, query, environment) =>
        state.desiredStateDiff.listByEnv[environment]
    );
  }
}
