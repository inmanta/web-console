import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { ServiceOrderItemRequest, words } from "@/Core";
import { usePost } from "@/Data/Queries/Helpers";
import { ServiceOrder } from "@/Slices/Orders/Core/Types";
import { DependencyContext } from "@/UI/Dependency";

interface PostResponse {
  data: ServiceOrder;
}

interface PostOrderBody {
  service_order_items: ServiceOrderItemRequest[];
  description: string;
}

/**
 * React Query hook for sending an order batch from Instance Composer.
 * @returns {Mutation} The mutation object for sending an order.
 */
export const usePostOrder = (
  options?: UseMutationOptions<PostResponse, Error, ServiceOrderItemRequest[]>
): UseMutationResult<PostResponse, Error, ServiceOrderItemRequest[]> => {
  const { environmentHandler } = useContext(DependencyContext);
  const env = environmentHandler.useId();
  const post = usePost(env)<PostOrderBody>;

  return useMutation({
    mutationFn: (service_order_items) =>
      post("/lsm/v2/order", {
        service_order_items,
        description: words("instanceComposer.orderDescription"),
      }),
    mutationKey: ["post_order", env],
    ...options,
  });
};
