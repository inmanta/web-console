import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class StateHelper extends PrimaryStateHelperWithEnv<"GetFacts"> {
  constructor(store: Store) {
    super(
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
}
