import { RemoteData } from "@/Core";
import { PrimaryStateHelper } from "@/Data/Common";
import { Store } from "@/Data/Store";

export function GetOrderDetailsStateHelper(store: Store) {
  return PrimaryStateHelper<"GetOrderDetails">(
    store,
    (data, { id }) => {
      const value = RemoteData.mapSuccess((data) => data, data);
      store.dispatch.orderDetails.setData({ id, data: value });
    },
    (state, { id }) => state.orderDetails.byId[id],
  );
}
