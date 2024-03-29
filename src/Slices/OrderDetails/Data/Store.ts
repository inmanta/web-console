import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<
  Query.Error<"GetOrderDetails">,
  Query.Data<"GetOrderDetails">
>;

/**
 * The Order Details Slice stores the ServiceOrderItem of orders, by order id.
 */
export interface OrderDetailsSlice {
  byId: Record<string, Data>;
  setData: Action<OrderDetailsSlice, { id: string; data: Data }>;
}

export const orderDetailsSlice: OrderDetailsSlice = {
  byId: {},
  setData: action((state, payload) => {
    state.byId[payload.id] = payload.data;
  }),
};
