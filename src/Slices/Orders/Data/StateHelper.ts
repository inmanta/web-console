import { RemoteData } from "@/Core";
import { PrimaryStateHelperWithEnv } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetOrdersStateHelper(store: Store) {
  return PrimaryStateHelperWithEnv<"GetOrders">(
    store,
    (data, _query, environment) => {
      const value = RemoteData.mapSuccess((wrapped) => wrapped, data);
      store.dispatch.orders.setList({
        environment,
        data: value,
      });
    },
    (state, _query, environment) => state.orders.listByEnv[environment],
  );
}
