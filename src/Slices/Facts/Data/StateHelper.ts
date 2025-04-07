import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function StateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetFacts">(
    store,
    (data, query, environment) => {
      store.dispatch.facts.setList({
        environment,
        data,
      });
    },
    (state, query, environment) => state.facts.listByEnv[environment]
  );
}
