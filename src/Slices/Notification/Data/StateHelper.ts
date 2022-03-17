import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export class StateHelper extends PrimaryStateHelperWithEnv<"GetNotifications"> {
  constructor(store: Store) {
    super(
      store,
      (data, { origin }, environment) => {
        store.dispatch.notification.setList({
          environment,
          origin,
          data,
        });
      },
      (state, { origin }, environment) =>
        origin === "center"
          ? state.notification.listByEnvForCenter[environment]
          : state.notification.listByEnvForDrawer[environment]
    );
  }
}
