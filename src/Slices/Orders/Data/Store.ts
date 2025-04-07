import { Action, action } from "easy-peasy";
import { RemoteData, Query } from "@/Core";

type Data = RemoteData.Type<Query.Error<"GetOrders">, Query.Data<"GetOrders">>;

export interface OrdersSlice {
  listByEnv: Record<string, Data>;
  setList: Action<
    OrdersSlice,
    {
      environment: string;
      data: Data;
    }
  >;
}

export const ordersSlice: OrdersSlice = {
  listByEnv: {},
  setList: action(({ listByEnv }, { environment, data }) => {
    listByEnv[environment] = data;
  }),
};
