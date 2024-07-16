import { UseMutationResult, useMutation } from "@tanstack/react-query";
import { ComposerServiceOrderItem } from "@/Slices/Orders/Core/Query";
import { PrimaryBaseUrlManager, words } from "@/UI";
import { useFetchHelpers } from "../helpers";

/**
 * React Query hook for sending an order batch from Instance Composer.
 * @returns {Mutation} The mutation object for sending an order.
 */
export const usePostOrder = (
  environment: string,
): UseMutationResult<void, Error, ComposerServiceOrderItem[], unknown> => {
  const { createHeaders, handleErrors } = useFetchHelpers();
  const headers = createHeaders(environment);
  const baseUrlManager = new PrimaryBaseUrlManager(
    globalThis.location.origin,
    globalThis.location.pathname,
  );
  const baseUrl = baseUrlManager.getBaseUrl(process.env.API_BASEURL);

  /**
   * Sends an order with the provided bundle instances.
   * @param {ComposerServiceOrderItem[]} serviceOrderItems - The bundled instances to include in the order.
   * @throws {Error} If the response is not successful, an error with the error message is thrown.
   */
  const postOrder = async (
    serviceOrderItems: ComposerServiceOrderItem[],
  ): Promise<void> => {
    const response = await fetch(baseUrl + `/lsm/v2/order`, {
      method: "POST",
      body: JSON.stringify({
        service_order_items: serviceOrderItems,
        description: words("inventory.instanceComposer.orderDescription"),
      }),
      headers,
    });

    await handleErrors(response);
  };

  return useMutation({
    mutationFn: postOrder,
    mutationKey: ["post_order"],
  });
};
