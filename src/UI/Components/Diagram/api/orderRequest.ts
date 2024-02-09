import { words } from "@/UI/words";
import { InstanceForApi } from "../interfaces";

/**
 * Sends an order for bundle instances to a specified base URL in a given environment.
 *
 * @param {string} baseUrl - The base URL to which the order should be sent.
 * @param {string} environment - The environment identifier for the order.
 * @param {InstanceForApi[]} bundleInstances - An array of instances to be bundled and ordered.
 * @returns {Promise<Response>} - A promise representing the fetch request for sending the order.
 */
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
