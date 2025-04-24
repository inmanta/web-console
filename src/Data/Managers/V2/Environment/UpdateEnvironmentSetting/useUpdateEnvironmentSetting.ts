import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { EnvironmentSettings } from "@/Core";
import { usePost } from "../../helpers";

/**
 * Interface for the parameters for the update environment setting mutation.
 */
interface UpdateParams {
  id: string;
  value: EnvironmentSettings.Value;
}

/**
 * React Query hook for updating an environment setting.
 *
 * @returns {UseMutationResult<void, Error, UpdateParams, unknown>} The mutation object for updating an environment setting.
 */
export const useUpdateEnvironmentSetting = (
  options?: UseMutationOptions<void, Error, UpdateParams>
): UseMutationResult<void, Error, UpdateParams> => {
  const client = useQueryClient();
  const post = usePost();

  return useMutation({
    mutationFn: ({ id, value }) => post(`/api/v2/environment_settings/${id}`, { value }),
    mutationKey: ["update_environment_setting"],
    onSuccess: () => {
      client.refetchQueries({
        queryKey: ["get_environments-one_time"],
      });
      client.refetchQueries({
        queryKey: ["get_environments-continuous"],
      });
      client.refetchQueries({
        queryKey: ["get_environment_settings-one_time"],
      });
      client.refetchQueries({
        queryKey: ["get_environment_details-one_time"],
      });
      client.refetchQueries({
        queryKey: ["get_environment_details-continuous"],
      });
      document.dispatchEvent(new Event("settings-update"));
    },
    ...options,
  });
};
