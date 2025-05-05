import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useDelete } from "../../helpers";

/**
 * React Query hook for resetting an environment setting to its default value.
 *
 * @returns {UseMutationResult<void, Error, string, unknown>} The mutation object for resetting an environment setting.
 */
export const useResetEnvironmentSetting = (
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> => {
  const client = useQueryClient();
  const deleteFn = useDelete();

  return useMutation({
    mutationFn: (id) => deleteFn(`/api/v2/environment_settings/${id}`),
    mutationKey: ["reset_environment_setting"],
    onSuccess: () => {
      client.refetchQueries();
    },
    ...options,
  });
};
