import { useContext } from "react";
import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import { ServiceOrder } from "@/Slices/Orders/Core/Types";
import { words } from "@/UI";
import { DependencyContext } from "@/UI";
import { ComposerServiceOrderItem } from "@/UI/Components/Diagram/interfaces";
import { usePost } from "@/Data/Queries";

interface PostResponse {
  data: ServiceOrder;
}

interface PostOrderBody {
  service_order_items: ComposerServiceOrderItem[];
  description: string;
}

/**
 * React Query hook for sending an order batch from Instance Composer.
 * @returns {Mutation} The mutation object for sending an order.
 */
export const usePostOrder = (
  options?: UseMutationOptions<PostResponse, Error, ComposerServiceOrderItem[]>
): UseMutationResult<PostResponse, Error, ComposerServiceOrderItem[]> => {
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
