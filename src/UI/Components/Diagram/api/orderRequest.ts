import { words } from "@/UI/words";
import { InstanceForApi } from "../interfaces";

export const sendOrder = (
  baseUrl: string,
  environment: string,
  bundleInstances: InstanceForApi[],
) => {
  return fetch(`${baseUrl}/lsm/v2/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Inmanta-tid": environment,
    },
    body: JSON.stringify({
      service_order_items: bundleInstances,
      description: words("inventory.instanceComposer.orderDescription"),
    }),
  });
};
