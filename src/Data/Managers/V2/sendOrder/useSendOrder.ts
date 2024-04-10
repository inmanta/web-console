import { useMutation } from "@tanstack/react-query";
import { PrimaryBaseUrlManager, words } from "@/UI";
import { InstanceForApi } from "@/UI/Components/Diagram/interfaces";
import { useCreateHeaders } from "../helpers/useCreateHeaders";
import { useHandleErrors } from "../helpers/useHandleErrors";

/**
 * Custom hook for sending an order batch from Instance COmposer.
 * @returns {Mutation} The mutation object for sending an order.
 */
export const useSendOrder = (environment: string) => {
  const { handleAuthorization } = useHandleErrors();
  const headers = useCreateHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Sends an order with the provided bundle instances.
   * @param {InstanceForApi[]} bundledInstances - The bundled instances to include in the order.
   * @throws {Error} If the response is not successful, an error with the error message is thrown.
   */
  const postOrder = async (
    bundledInstances: InstanceForApi[],
  ): Promise<void> => {
    const response = await fetch(baseUrl + `/lsm/v2/order`, {
      method: "POST",
      body: JSON.stringify({
        service_order_items: bundledInstances,
        description: words("inventory.instanceComposer.orderDescription"),
      }),
      headers,
    });
    handleAuthorization(response);
    if (!response.ok) {
      throw new Error(JSON.parse(await response.text()).message);
    }
  };

  return useMutation({
    mutationFn: postOrder,
    mutationKey: ["post_order"],
  });
};
