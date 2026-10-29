import { Route } from "@inmanta/web-console-core";

declare module "@inmanta/web-console-core/Domain/Route" {
  interface RouteRegistry {
    OrderDetails: { id: string };
  }
}

export const path = "/order-details/:id";

export const route = (base: string): Route<"OrderDetails"> => ({
  kind: "OrderDetails",
  parent: "Orders",
  path: `${base}${path}`,
  generateLabel: () => "Order Details",
  environmentRole: "Required",
});
