import {
  UseMutationResult,
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from "@tanstack/react-query";
import { usePatch } from "../../helpers";

/**
 * Body parameters for updating a notification.
 *
 * @property {boolean} [read] - Whether the notification has been read
 * @property {boolean} [cleared] - Whether the notification has been cleared
 */
export interface UpdateNotificationBody {
  read?: boolean;
  cleared?: boolean;
}

/**
 * Parameters for the notification update mutation.
 *
 * @property {UpdateNotificationBody} body - The update payload
 * @property {string[]} ids - Array of notification IDs to update
 */
export interface UpdateNotificationParams {
  body: UpdateNotificationBody;
  ids: string[];
}

/**
 * React Query hook for updating notifications.
 *
 * @param {UseMutationOptions} options - Additional options for the mutation
 * @returns {UseMutationResult} A mutation result containing the response or an error
 */
export const useUpdateNotification = (
  options?: UseMutationOptions<void, Error, UpdateNotificationParams>
): UseMutationResult<void, Error, UpdateNotificationParams> => {
  const patch = usePatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateNotificationParams) => {
      await Promise.all(
        params.ids.map((id) => patch(`/api/v2/notification/${encodeURIComponent(id)}`, params.body))
      );
    },
    onSuccess: () => {
      // Invalidate relevant queries based on origin
      queryClient.invalidateQueries({
        queryKey: ["get_notifications"],
      });
    },
    ...options,
  });
};
