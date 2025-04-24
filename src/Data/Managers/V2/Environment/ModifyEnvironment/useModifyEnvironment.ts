import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ModifyEnvironmentParams } from "@/Core";
import { usePost } from "../../helpers";

/**
 * React Query hook for modifying an environment.
 *
 * @returns {UseMutationResult<void, Error, ModifyEnvironmentParams, unknown>} The mutation object for modifying an environment.
 */
export const useModifyEnvironment = (
  environmentId: string,
  options?: UseMutationOptions<void, Error, ModifyEnvironmentParams>
): UseMutationResult<void, Error, ModifyEnvironmentParams> => {
  const client = useQueryClient();
  const post = usePost()<ModifyEnvironmentParams>;

  return useMutation({
    mutationFn: (params) => post(`/api/v2/environment/${environmentId}`, params),
    mutationKey: ["modify_environment", environmentId],
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["get_environments-one_time"] });
      client.invalidateQueries({ queryKey: ["get_environments-continuous"] });
      client.invalidateQueries({
        queryKey: ["get_environment_details-one_time", environmentId],
      });
      client.invalidateQueries({
        queryKey: ["get_environment_details-continuous", environmentId],
      });
    },
    ...options,
  });
};
