import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class GetParametersStateHelper extends PrimaryStateHelperWithEnv<"GetParameters"> {
  constructor(store: Store) {
    super(
      store,
      (data, query, environment) => {
        const value = RemoteData.mapSuccess((wrapped) => wrapped, data);
        store.dispatch.parameters.setList({
          environment,
          data: value,
        });
      },
      (state, query, environment) => state.parameters.listByEnv[environment]
    );
  }
}
