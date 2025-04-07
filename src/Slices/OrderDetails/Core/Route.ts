import { Route } from "@/Core";

export const path = "/order-details/:id";

export const route = (base: string): Route<"OrderDetails"> => ({
  kind: "OrderDetails",
  parent: "Orders",
  path: `${base}${path}`,
  generateLabel: () => "Order Details",
  environmentRole: "Required",
});
