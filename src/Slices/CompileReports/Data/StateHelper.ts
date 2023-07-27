import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function StateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetCompileReports">(
    store,
    (data, query, environment) => {
      const value = RemoteData.mapSuccess((data) => data, data);
      store.dispatch.compileReports.setList({
        environment,
        data: value,
      });
    },
    (state, query, environment) => state.compileReports.listByEnv[environment],
  );
}
