import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ParsedNumber } from "@/Core";
import { Dict } from "@/UI/Components";
import { usePost } from "../../helpers";

/**
 * Interface for the parameters for the update environment configuration mutation.
 */
interface ConfigUpdateParams {
  id: string;
  updatedValue: UpdateValue;
}

/**
 * Interface for the value for the update environment configuration mutation.
 */
type UpdateValue = { value: string | boolean | ParsedNumber | Dict };

/**
 * React Query hook for updating environment configuration settings.
 *
 * @returns {UseMutationResult<void, Error, ConfigUpdateParams, unknown>}- The mutation object from `useMutation` hook.
 */
export const useUpdateEnvConfig = (
  options?: UseMutationOptions<void, Error, ConfigUpdateParams, unknown>
): UseMutationResult<void, Error, ConfigUpdateParams, unknown> => {
  const client = useQueryClient();

  const post = usePost()<UpdateValue>;

  return useMutation({
    mutationFn: ({ id, updatedValue }) => post(`/api/v2/environment_settings/${id}`, updatedValue),
    mutationKey: ["update_env_config"],
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ["get_env_config"], //for the future rework of the env getter
      });
      client.invalidateQueries({
        queryKey: ["get_env_details"], //for the future rework of the env getter
      });
      document.dispatchEvent(new Event("settings-update"));
    },
    ...options,
  });
};
