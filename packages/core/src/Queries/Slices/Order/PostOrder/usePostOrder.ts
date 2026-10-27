import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { ServiceOrderItemRequest } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { ServiceOrder } from "@inmanta/web-console-core/Domain/ServiceOrderModel";
import { getRequiredResponseBody, usePost } from "@inmanta/web-console-core/Queries/Helpers";

interface PostResponse {
  data: ServiceOrder;
}

interface PostOrderBody {
  service_order_items: ServiceOrderItemRequest[];
  description: string;
}

/**
 * The description the order is stored with. It is data the orchestrator keeps and shows to every
 * user, so it is not translated.
 */
const ORDER_DESCRIPTION = "Requested with Instance Composer";

/**
 * React Query hook for sending an order batch from Instance Composer.
 * @returns {Mutation} The mutation object for sending an order.
 */
export const usePostOrder = (
  options?: UseMutationOptions<PostResponse, Error, ServiceOrderItemRequest[]>
): UseMutationResult<PostResponse, Error, ServiceOrderItemRequest[]> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<PostOrderBody, PostResponse>;

  return useMutation({
    mutationFn: async (service_order_items) =>
      getRequiredResponseBody(
        await post("/lsm/v2/order", {
          service_order_items,
          description: ORDER_DESCRIPTION,
        })
      ),
    mutationKey: ["post_order", env],
    ...options,
  });
};
