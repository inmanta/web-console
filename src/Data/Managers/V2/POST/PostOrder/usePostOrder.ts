import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { words } from "@/UI";
import { ComposerServiceOrderItem } from "@/UI/Components/Diagram/interfaces";
import { usePost } from "../../helpers/useQueries";
import { ServiceOrder } from "@/Slices/Orders/Core/Query";

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
  options?: UseMutationOptions<PostResponse, Error, ComposerServiceOrderItem[]>,
): UseMutationResult<
  PostResponse,
  Error,
  ComposerServiceOrderItem[],
  unknown
> => {
  const post = usePost()<PostResponse, PostOrderBody>;

  return useMutation({
    mutationFn: (service_order_items) =>
      post(`/lsm/v2/order`, {
        service_order_items,
        description: words("instanceComposer.orderDescription"),
      }),
    mutationKey: ["post_order"],
    ...options,
  });
};
